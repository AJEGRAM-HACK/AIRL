import { test, expect } from "@playwright/test";
import { PlatformStore } from "../../src/server/platform/store";
const origin = "http://127.0.0.1:3100";
test("viewer onboarding, creator permissions, both creation paths and private-world isolation", async ({
  browser,
}) => {
  const admin = await browser.newContext(),
    creator = await browser.newContext({
      viewport: { width: 390, height: 844 },
    }),
    outsider = await browser.newContext();
  try {
    await admin.request.post("/api/account", {
      headers: { Origin: origin },
      data: {
        action: "signup",
        email: "platform-admin@example.test",
        name: "Admin",
        password: "test-password-1234",
      },
    });
    const store = new PlatformStore(process.env.AIRL_LIVE_DB_PATH);
    try {
      store.bootstrapAdmin("platform-admin@example.test");
    } finally {
      store.close();
    }
    const page = await creator.newPage();
    await page.goto("/account");
    await page.getByRole("button", { name: "Sign up", exact: true }).click();
    await page.getByLabel("Name", { exact: true }).fill("World creator");
    await page
      .getByLabel("Email", { exact: true })
      .fill("world-creator@example.test");
    await page
      .getByLabel("Password", { exact: true })
      .fill("test-password-1234");
    await page.getByRole("button", { name: "Create viewer account" }).click();
    await expect(
      page.getByRole("heading", { name: "What stories are you into?" }),
    ).toBeVisible();
    await page.getByLabel(/Genres/).fill("Mystery");
    await page.getByRole("button", { name: "Save interests" }).click();
    const current = (await (await creator.request.get("/api/account")).json())
      .account;
    expect(current.role).toBe("viewer");
    expect(
      (
        await creator.request.post("/api/universes", {
          headers: { Origin: origin },
          data: { title: "Forbidden" },
        })
      ).status(),
    ).toBe(403);
    await admin.request.post("/api/admin", {
      headers: { Origin: origin },
      data: { accountId: current.id, role: "creator" },
    });
    await page.goto("/studio");
    await page.getByRole("button", { name: "Start from scratch" }).click();
    await page.waitForURL(/\/studio\/worlds\//);
    const id = page.url().split("/").pop()!;
    await page.getByLabel("Title", { exact: true }).fill("Private observatory");
    await page
      .getByLabel("Setting", { exact: true })
      .fill("An observatory under the northern lights");
    await page.getByRole("button", { name: "Save world settings" }).click();
    await page.getByLabel("id", { exact: true }).fill("guide");
    await page.getByLabel("name", { exact: true }).fill("The Archivist");
    await page
      .getByRole("button", { name: "Save character", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "The Archivist", exact: true }),
    ).toBeVisible();
    const reference = await creator.request.post(
      `/api/universes/${id}/assets`,
      {
        headers: { Origin: origin },
        data: {
          name: "Original reference",
          mime: "image/png",
          base64:
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+yY8sAAAAASUVORK5CYII=",
        },
      },
    );
    expect(reference.status()).toBe(200);
    const asset = (await reference.json()).id;
    expect((await outsider.request.get(`/api/assets/${asset}`)).status()).toBe(
      404,
    );
    expect((await creator.request.get(`/api/assets/${asset}`)).status()).toBe(
      200,
    );
    for (const path of [
      `/api/universes/${id}`,
      `/api/production?universe=${id}&operator=1`,
    ])
      expect((await outsider.request.get(path)).status()).toBe(404);
    expect(
      (
        await outsider.request.post(`/api/universes/${id}/ask`, {
          headers: { Origin: origin },
          data: {
            question: "Secret?",
            scope: "latest",
            provider: { mode: "demo", consent: false },
          },
        })
      ).status(),
    ).toBe(404);
    expect(
      (
        await creator.request.patch("/api/universes/barangay-2099", {
          headers: { Origin: origin },
          data: { title: "Hijacked" },
        })
      ).status(),
    ).toBe(403);
    await page.getByRole("button", { name: /Join room to vote/ }).click();
    await page.getByText('Production settings', { exact: true }).click();
    await page
      .getByLabel("Production provider", { exact: true })
      .selectOption("demo");
    await page
      .getByRole("button", { name: "Close voting & produce", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Approve & publish" }),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Last valid preview/)).toBeVisible();
    await page
      .getByLabel("Approved canon changes")
      .fill(
        JSON.stringify({
          memoryUpdates: [
            {
              characterId: "guide",
              memory: "The guide continued the plan.",
              sceneId: "scene-1",
            },
          ],
          relationshipUpdates: [],
        }),
      );
    await page.getByRole("button", { name: "Approve & publish" }).click();
    const world = await (
      await creator.request.get(`/api/universes/${id}`)
    ).json();
    expect(world.episodes).toHaveLength(1);
    expect(
      world.timeline.some(
        (item: any) => item.content === "The guide continued the plan.",
      ),
    ).toBe(true);
    await page.goto(
      `/universes/${id}/episodes/${world.episodes[0].episode_id}`,
    );
    await page.getByRole("button", { name: "Play video", exact: true }).click();
    await expect
      .poll(async () =>
        Number(
          await page.locator(".remotion-preview").getAttribute("data-frame"),
        ),
      )
      .toBeGreaterThan(15);
    const helper = page.locator(".story-helper");
    await helper.getByText("Provider and model", { exact: true }).click();
    await helper
      .getByLabel("Production provider", { exact: true })
      .selectOption("demo");
    await helper.getByRole("button", { name: "Ask the story" }).click();
    await expect(helper.locator('a[href*="#scene-"]').first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.goto("/studio");
    await page.getByRole('button', { name: 'Generate starting points', exact: true }).click();
    await page
      .getByLabel("Production provider", { exact: true })
      .selectOption("demo");
    await page.getByRole("button", { name: "Generate three pitches" }).click();
    await expect(
      page.getByRole("button", { name: "Edit this pitch" }),
    ).toHaveCount(3);
    await page.getByRole("button", { name: "Edit this pitch" }).first().click();
    await page
      .getByLabel("Title", { exact: true })
      .fill("Edited generated world");
    await page
      .getByRole("button", { name: "Save private universe draft" })
      .click();
    await page.waitForURL(/\/studio\/worlds\//);
    const pitchId = page.url().split("/").pop()!;
    expect(pitchId).not.toBe(id);
    expect(
      (await outsider.request.get(`/api/universes/${pitchId}`)).status(),
    ).toBe(404);
    await page
      .getByRole("button", { name: "Publish universe to Explore" })
      .click();
    await expect(
      page.getByRole("button", { name: "Make private" }),
    ).toBeVisible();
    expect(
      (await outsider.request.get(`/api/universes/${pitchId}`)).status(),
    ).toBe(200);
    await page.goto("/account");
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Sign in", exact: true }).first(),
    ).toBeVisible();
    expect(
      (await (await creator.request.get("/api/account")).json()).account,
    ).toBeNull();
  } finally {
    await admin.close();
    await creator.close();
    await outsider.close();
  }
});
