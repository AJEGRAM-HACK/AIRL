"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Account, Interests } from "@/lib/domain";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { api } from "./api";
export function InterestFields({
  value,
  onChange,
}: {
  value: z.infer<typeof Interests>;
  onChange: (value: z.infer<typeof Interests>) => void;
}) {
  return (
    <div className="form-grid">
      {(["genres", "settings", "themes", "languages", "avoid"] as const).map(
        (key) => (
          <label key={key}>
            {
              {
                genres: "Genres",
                settings: "Settings or eras",
                themes: "Themes",
                languages: "Preferred languages",
                avoid: "Topics to avoid",
              }[key]
            }
            <input
              value={value[key].join(", ")}
              onChange={(event) =>
                onChange({
                  ...value,
                  [key]: event.target.value
                    .split(",")
                    .map((item) => item.trim()),
                })
              }
            />
            <small>Separate entries with commas.</small>
          </label>
        ),
      )}
      <label>
        Tone
        <input
          value={value.tone}
          onChange={(event) => onChange({ ...value, tone: event.target.value })}
        />
      </label>
      <label>
        Your story idea
        <textarea
          maxLength={1000}
          value={value.idea}
          onChange={(event) => onChange({ ...value, idea: event.target.value })}
        />
      </label>
    </div>
  );
}
export function AccountPanel() {
  const [account, setAccount] = useState<Account | null>(null),
    [loaded, setLoaded] = useState(false),
    [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState(""),
    [name, setName] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [pending, setPending] = useState(false);
  const [interests, setInterests] = useState(Interests.parse({}));
  useEffect(() => {
    api("/api/account")
      .then((data) => {
        setAccount(data.account);
        if (data.account) setInterests(Interests.parse(data.account.interests));
      })
      .catch((error) => setError(error.message))
      .finally(() => setLoaded(true));
  }, []);
  async function run(action: string) {
    setPending(true);
    setError("");
    try {
      const data = await api("/api/account", {
        action,
        email,
        name,
        password,
        ...(action === "interests" ? { interests } : {}),
      });
      setAccount(data.account);
      setPassword("");
      if (data.account) setInterests(Interests.parse(data.account.interests));
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="platform-narrow">
      <h1>{account ? "Your profile" : "Join AIRL"}</h1>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {!loaded ? (
        <p>Loading profile…</p>
      ) : account ? (
        <>
          <p>
            {account.name} · {account.role}
          </p>
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => run("signout")}
          >
            Sign out
          </Button>
          <section className="panel platform-form">
            <h2>What stories are you into?</h2>
            <p>Your preferences are private and optional.</p>
            <InterestFields value={interests} onChange={setInterests} />
            <Button disabled={pending} onClick={() => run("interests")}>
              Save interests
            </Button>
            <Button asChild variant="ghost">
              <Link href="/universes">
                {account.onboarded ? "Explore universes" : "Skip for now"}
              </Link>
            </Button>
          </section>
          <Button asChild variant="outline">
            <Link href="/studio">Creator Studio</Link>
          </Button>
        </>
      ) : (
        <section className="panel platform-form">
          <div className="provider-actions">
            <Button
              variant={mode === "signin" ? "default" : "outline"}
              onClick={() => setMode("signin")}
            >
              Sign in
            </Button>
            <Button
              variant={mode === "signup" ? "default" : "outline"}
              onClick={() => setMode("signup")}
            >
              Sign up
            </Button>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void run(mode);
            }}
          >
            {mode === "signup" && (
              <label>
                Name
                <input
                  required
                  value={name}
                  maxLength={80}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
            )}
            <label>
              Email
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label>
              Password
              <input
                aria-label="Password"
                required
                type="password"
                minLength={12}
                maxLength={128}
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <small>At least 12 characters.</small>
            </label>
            <Button disabled={pending}>
              {mode === "signin" ? "Sign in" : "Create viewer account"}
            </Button>
          </form>
          <p>
            Viewers can follow stories and vote. Admins grant creator access.
          </p>
        </section>
      )}
    </div>
  );
}
