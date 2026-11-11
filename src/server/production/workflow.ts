import { z } from 'zod';
import { Concept, Script, Manifest, Critique, Input, validateScript, validateManifest, type Stage, type ProductionInput } from './schemas';
import { ProductionStore } from './store';
export interface Executor {
  executionMode?: import('@/ai/schemas/gateway').Mode | 'openai';
  preflight(): Promise<void>;
  execute(stage: Stage, schema: z.ZodType, prompt: string): Promise<unknown>;
}
// Persist safe classifications, never raw SDK error messages or request bodies.
export function safeFailure(error: unknown) {
  if (error instanceof Error && ['AbortError','TimeoutError'].includes(error.name)) return { code: 'request_timeout_or_cancelled' };
  const status = typeof error === 'object' && error !== null && 'status' in error ? Number(error.status) : undefined;
  return { code: status === 401 ? 'authentication_failed' : status === 403 || status === 404 ? 'model_access_failed' : status === 429 ? 'rate_limit_or_quota' : error instanceof z.ZodError ? 'schema_validation_failed' : 'execution_failed', ...(Number.isFinite(status) ? { httpStatus: status } : {}) };
}
export async function produce(store: ProductionStore, executor: Executor, rawInput: ProductionInput, model: string, onRun: (id: string) => void = () => {}, deferPublication = false) {
  const input = Input.parse(rawInput);
  const id = store.create(input, model, executor.executionMode || 'openai');
  try {
    onRun(id);
    store.event(id, 'Connection', 1, 'started');
    await executor.preflight();
    store.event(id, 'Connection', 1, 'succeeded', { model, executionMode: executor.executionMode || 'openai' });
    const context = store.context(input.roomId, executor.executionMode || 'openai', deferPublication);
    const base = JSON.stringify({ input, context });
    async function stage<T extends z.ZodType>(name: Stage, schema: T, prompt: string, validate?: (value: z.infer<T>) => void): Promise<z.infer<T>> {
      for (let attempt = 1; attempt <= 2; attempt++) {
        store.event(id, name, attempt, 'started');
        try {
          const output = schema.parse(await executor.execute(name, schema, prompt));
          validate?.(output);
          store.event(id, name, attempt, 'succeeded', { output });
          return output;
        } catch (error) {
          store.event(id, name, attempt, 'failed', safeFailure(error));
          // Retry malformed outputs only; authentication, billing and transport errors need intervention.
          if (attempt === 2 || !(error instanceof z.ZodError)) throw error;
        }
      }
      throw new Error('Attempts exhausted');
    }
    const concept = await stage('Story Director', Concept, base);
    let feedback: unknown = null;
    for (let revision = 0; revision <= 1; revision++) {
      const script = await stage('Screenwriter', Script, JSON.stringify({ base, concept, feedback }), validateScript);
      const manifest = await stage('Visual Producer', Manifest, JSON.stringify({ script }), value => validateManifest(value, script));
      const critique = await stage('Creative Critic', Critique, JSON.stringify({ base, concept, script, manifest }));
      if (critique.approved) {
        if (deferPublication) {
          store.saveDraft(id, { concept, script, manifest, critique, executionMode: executor.executionMode || 'openai' });
          return { id, status: 'review' as const, manifest };
        }
        store.approve(id, input.roomId, { concept, script, manifest, critique, executionMode: executor.executionMode || 'openai' }, script.memoryUpdates);
        return { id, status: 'complete' as const, manifest };
      }
      feedback = critique;
    }
    store.finish(id, 'review');
    return { id, status: 'review' as const };
  } catch (error) {
    store.event(id, 'Workflow', 0, 'failed', safeFailure(error));
    store.finish(id, 'failed');
    throw new Error(`Production ${id} failed. Inspect its persisted events; no episode was published.`);
  }
}
