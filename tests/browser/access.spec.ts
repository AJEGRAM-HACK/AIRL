import { test, expect, type Page } from "@playwright/test";
import { PlatformStore } from "../../src/server/platform/store";

const origin = "http://127.0.0.1:3100";
const password = "role-test-password-1234";
async function noManagement(page: Page) {
  await expect(
    page.getByRole("link", {
      name: /^(Studio|Creator Studio|Open Studio|Manage world|Create a Universe)$/,
    }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Talk using your selected AI provider →" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: /Close voting & produce|Approve & publish|Generate three pitches/,
    }),
  ).toHaveCount(0);
}

test("viewers see audience features while creators and admins see only their permitted Studio controls", async ({
  browser,
}) => {
  const guest = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const viewer = await browser.newContext();
  const creator = await browser.newContext();
  const admin = await browser.newContext();
  try {
    for (const [context, name] of [
      [viewer, "viewer"],
      [creator, "creator"],
      [admin, "admin"],
    ] as const) {
      const response = await context.request.post("/api/account", {
        headers: { Origin: origin },
        data: {
          action: "signup",
          email: `access-${name}@example.test`,
          name,
          password,
        },
      });
      expect(response.status()).toBe(200);
    }
    const store = new PlatformStore(process.env.AIRL_LIVE_DB_PATH);
    try {
      store.bootstrapAdmin("access-admin@example.test");
      const actor = store.db
        .prepare(
          "SELECT id FROM accounts WHERE email='access-creator@example.test'",
        )
        .get()!;
      const administrator = (
        await (await admin.request.get("/api/account")).json()
      ).account;
      store.grant(administrator, String(actor.id), "creator");
    } finally {
      store.close();
    }
    const own = (
      await (
        await creator.request.post("/api/universes", {
          headers: { Origin: origin },
          data: { title: "Creator-owned public world" },
        })
      ).json()
    ).universe;
    const other = (
      await (
        await admin.request.post("/api/universes", {
          headers: { Origin: origin },
          data: { title: "Admin-owned public world" },
        })
      ).json()
    ).universe;
    for (const [context, id] of [
      [creator, own.id],
      [admin, other.id],
    ] as const)
      expect(
        (
          await context.request.patch(`/api/universes/${id}`, {
            headers: { Origin: origin },
            data: { visibility: "public" },
          })
        ).status(),
      ).toBe(200);

    for (const context of [guest, viewer]) {
      const page = await context.newPage();
      for (const path of [
        "/",
        "/universes",
        "/universes/barangay-2099",
        "/persona/captain-bot",
        "/account",
      ]) {
        await page.goto(path);
        await noManagement(page);
      }
      await page.goto("/persona/captain-bot");
      if (context === guest)
        await expect(
          page.getByRole("button", { name: "Ask the story" }),
        ).toHaveCount(0);
      else
        await expect(
          page.getByRole("button", { name: "Ask the story" }),
        ).toBeVisible();
      for (const path of [
        "/studio",
        "/studio/ai",
        "/studio/barangay-2099",
        "/studio/worlds/barangay-2099",
        `/studio/worlds/${own.id}`,
      ])
        expect((await context.request.get(path)).status(), path).toBe(404);
      await page.goto("/live/barangay-2099");
      await expect(
        page.getByRole("button", { name: /Join room to vote/ }),
      ).toBeVisible();
      await page.getByRole("button", { name: /Join room to vote/ }).click();
      await expect(
        page.getByRole("button", { name: "Cast my vote", exact: true }),
      ).toBeVisible();
      await noManagement(page);
    }
    for (const path of ["/api/admin", "/api/ai", "/api/production?operator=1"])
      expect((await viewer.request.get(path)).status()).toBe(403);

    const creatorPage = await creator.newPage();
    await creatorPage.goto('/');
    await expect(creatorPage.getByRole('link', { name: 'Create a Universe', exact: true })).toHaveAttribute('href', '/studio#create-universe');
    await expect(creatorPage.getByRole('link', { name: 'Profile', exact: true })).toBeVisible();
    await creatorPage.goto("/universes");
    await expect(
      creatorPage
        .getByRole("navigation", { name: "Main navigation" })
        .getByRole("link", { name: "Studio", exact: true }),
    ).toBeVisible();
    const ownCard = creatorPage
      .locator(".world-card")
      .filter({ has: creatorPage.getByRole("heading", { name: own.title }) });
    const otherCard = creatorPage
      .locator(".world-card")
      .filter({ has: creatorPage.getByRole("heading", { name: other.title }) });
    await expect(
      ownCard.getByRole("link", { name: "Open Studio" }),
    ).toBeVisible();
    await expect(
      otherCard.getByRole("link", { name: "Open Studio" }),
    ).toHaveCount(0);
    await creatorPage.goto("/universes/barangay-2099");
    await expect(
      creatorPage
        .getByRole("navigation", { name: "Universe navigation" })
        .getByRole("link", { name: "Studio", exact: true }),
    ).toHaveCount(0);
    await expect(
      creatorPage.getByRole("link", { name: "Manage world" }),
    ).toHaveCount(0);
    await expect(
      creatorPage
        .getByRole("navigation", { name: "Main navigation" })
        .getByRole("link", { name: "Studio" }),
    ).toHaveAttribute("href", "/studio");
    expect(
      (await creator.request.get("/studio/worlds/barangay-2099")).status(),
    ).toBe(404);
    await creatorPage.goto(`/studio/worlds/${own.id}`);
    await expect(
      creatorPage.getByRole("heading", { name: "World Settings" }),
    ).toBeVisible();
    await creatorPage.goto("/studio");
    await expect(
      creatorPage.getByRole("button", { name: "Start from scratch" }),
    ).toBeVisible();
    await expect(
      creatorPage.getByRole("heading", { name: "Account permissions" }),
    ).toHaveCount(0);

    const adminPage = await admin.newPage();
    await adminPage.goto("/studio");
    await expect(
      adminPage.getByRole("heading", { name: "Account permissions" }),
    ).toBeVisible();
    await adminPage.goto("/studio/barangay-2099");
    await expect(
      adminPage.getByRole("button", {
        name: "Close voting & produce",
        exact: true,
      }),
    ).toBeVisible();
    await adminPage.goto("/account");
    await adminPage
      .getByRole("button", { name: "Sign out", exact: true })
      .click();
    await noManagement(adminPage);
    await adminPage
      .getByLabel("Email", { exact: true })
      .fill("access-admin@example.test");
    await adminPage.getByLabel("Password", { exact: true }).fill(password);
    await adminPage
      .getByRole("button", { name: "Sign in", exact: true })
      .last()
      .click();
    await expect(
      adminPage
        .getByRole("navigation", { name: "Main navigation" })
        .getByRole("link", { name: "Studio" }),
    ).toBeVisible();
    await adminPage
      .getByRole("button", { name: "Sign out", exact: true })
      .click();
    await adminPage.goto("/");
    await noManagement(adminPage);
  } finally {
    await guest.close();
    await viewer.close();
    await creator.close();
    await admin.close();
  }
});
