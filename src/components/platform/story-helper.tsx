"use client";
import { useAccess } from "./access";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { api } from "./api";
import { ProviderPicker, defaultProvider } from "./provider-picker";
export function StoryHelper({
  universeId,
  episodeId,
  characterId,
  draftRun,
  suggestedQuestion,
}: {
  universeId: string;
  episodeId?: string;
  characterId?: string;
  draftRun?: string;
  suggestedQuestion?: string;
}) {
  const {account}=useAccess();
  const [question, setQuestion] = useState(suggestedQuestion || "What happened most recently?"),
    [scope, setScope] = useState(episodeId ? "episode" : "latest"),
    [provider, setProvider] = useState(defaultProvider),
    [answer, setAnswer] = useState<any>(null),
    [error, setError] = useState(""),
    [pending, setPending] = useState(false);
  useEffect(()=>{setProvider(defaultProvider);setAnswer(null);},[account?.id]);
  async function ask() {
    setPending(true);
    setError("");
    try {
      setAnswer(
        await api(`/api/universes/${universeId}/ask`, {
          question,
          scope,
          episodeId,
          characterId,
          provider,
          ...(draftRun ? { draft: true, runId: draftRun } : {}),
        }),
      );
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setPending(false);
      setProvider((value) => ({ ...value, consent: false }));
    }
  }
  if(!account)return <section className="panel platform-form story-helper"><h2>Ask about this story</h2><p><Link href="/account">Sign in</Link> to ask about this story.</p></section>;
  return (
    <section className="panel platform-form story-helper">
      <h2>Ask about this story</h2>
      {draftRun && (
        <p className="notice">
          Studio draft mode · unpublished sources may be used.
        </p>
      )}
      <label>
        Source scope
        <select
          aria-label="Source scope"
          value={scope}
          onChange={(event) => setScope(event.target.value)}
        >
          {episodeId && (
            <>
              <option value="episode">This episode</option>
              <option value="through">Through this episode</option>
            </>
          )}
          <option value="latest">Latest canon</option>
        </select>
      </label>
      <label>
        Your question
        <textarea
          value={question}
          maxLength={1000}
          onChange={(event) => setQuestion(event.target.value)}
        />
      </label>
      <details>
        <summary>Provider and model</summary>
        <ProviderPicker value={provider} onChange={setProvider} />
      </details>
      <Button disabled={pending || !question.trim()} onClick={ask}>
        {pending ? "Reading story sources…" : "Ask the story"}
      </Button>
      {error && (
        <p role="alert">
          {error} <Link href="/account">Your account</Link>
        </p>
      )}
      {answer && (
        <div role="status">
          <p>{answer.result.answer}</p>
          {answer.result.unclear && (
            <p className="fine-print">
              The available sources leave part of this answer unclear.
            </p>
          )}
          <ul>
            {answer.citations.map((citation: any) => (
              <li key={citation.id}>
                <Link href={citation.href}>
                  {citation.draft ? "Draft · " : ""}
                  {citation.episodeTitle} ·{" "}
                  {citation.sceneId
                    ? `Scene ${citation.sceneId}`
                    : "Canon event"}
                  {citation.timestamp !== null
                    ? ` · ${citation.timestamp}s`
                    : ""}{" "}
                  · story order {citation.storyOrder}
                </Link>
              </li>
            ))}
          </ul>
          <small>
            {answer.mode} · {answer.model}
          </small>
        </div>
      )}
    </section>
  );
}
