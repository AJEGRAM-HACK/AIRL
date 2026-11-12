"use client";
import { useEffect, useState } from "react";
import { api } from "./api";
export type ProviderChoice = {
  mode: "ollama" | "demo" | "hosted_openai" | "creator_byok";
  model?: string;
  consent: boolean;
  apiKey?: string;
};
export const defaultProvider: ProviderChoice = {
  mode: "ollama",
  model: "qwen3:4b-instruct",
  consent: false,
};
export function ProviderPicker({
  value,
  onChange,
  background = false,
  labelPrefix = 'Production',
}: {
  value: ProviderChoice;
  onChange: (value: ProviderChoice) => void;
  background?: boolean;
  labelPrefix?: string;
}) {
  const [catalog, setCatalog] = useState<{
    ollama: string[];
    hosted: string[];
    ollamaError?: string;
  } | null>(null);
  useEffect(() => {
    api("/api/models")
      .then(setCatalog)
      .catch(() => {});
    return () => {};
  }, []);
  const models =
    value.mode === "hosted_openai" ? catalog?.hosted : catalog?.ollama;
  return (
    <fieldset className="platform-provider">
      <legend>Inference</legend>
      <label>
        Provider
        <select
          aria-label={`${labelPrefix} provider`}
          value={value.mode}
          onChange={(event) =>
            onChange({
              mode: event.target.value as ProviderChoice["mode"],
              consent: false,
              ...(event.target.value === "ollama"
                ? {
                    model: catalog?.ollama.includes("qwen3:4b-instruct")
                      ? "qwen3:4b-instruct"
                      : catalog?.ollama[0] || "qwen3:4b-instruct",
                  }
                : {}),
            })
          }
        >
          <option value="ollama">Local Ollama</option>
          <option value="demo">Demo · offline</option>
          <option value="hosted_openai">Hosted OpenAI · paid</option>
          {!background && (
            <option value="creator_byok">Session OpenAI key · paid</option>
          )}
        </select>
      </label>
      {value.mode !== "demo" && (
        <label>
          Model
          {value.mode === "creator_byok" || !catalog ? (
            <input
              aria-label={`${labelPrefix} model`}
              value={value.model || ""}
              onChange={(event) =>
                onChange({ ...value, model: event.target.value })
              }
            />
          ) : (
            <select
              aria-label={`${labelPrefix} model`}
              value={value.model || ""}
              onChange={(event) =>
                onChange({ ...value, model: event.target.value })
              }
            >
              <option value="">Select an available model</option>
              {models?.map((model) => (
                <option key={model}>{model}</option>
              ))}
            </select>
          )}
        </label>
      )}
      {value.mode === "ollama" && catalog?.ollamaError && (
        <p role="status">{catalog.ollamaError}</p>
      )}
      {value.mode === "hosted_openai" && catalog && !catalog.hosted.length && (
        <p>Hosted OpenAI is awaiting server configuration.</p>
      )}
      {value.mode === "creator_byok" && (
        <label>
          Request-only OpenAI key
          <input
            type="password"
            autoComplete="off"
            value={value.apiKey || ""}
            onChange={(event) =>
              onChange({ ...value, apiKey: event.target.value })
            }
          />
        </label>
      )}
      {["hosted_openai", "creator_byok"].includes(value.mode) && (
        <label className="check-label">
          <input
            type="checkbox"
            checked={value.consent}
            onChange={(event) =>
              onChange({ ...value, consent: event.target.checked })
            }
          />
          I authorize this paid operation.
        </label>
      )}
    </fieldset>
  );
}
