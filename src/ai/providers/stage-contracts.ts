import { z } from "zod";
import { Script, ScriptScene, Manifest } from "@/server/production/schemas";
import type { ScriptInput, ScriptOutput, ReviewInput } from "./creative";

// Both live adapters use the same bounded model contracts and deterministic assembly.
export const scriptContract = Script.extend({
  scenes: z
    .array(
      ScriptScene.extend({ dialogue: ScriptScene.shape.dialogue.length(1) }),
    )
    .length(3),
});
export const visualContract = Manifest.omit({ scenes: true }).extend({
  scenes: z
    .array(Manifest.shape.scenes.element.omit({ id: true, dialogue: true }))
    .length(3),
});
export const stageGuidance = {
  director: " Keep each field under 40 words. Use only the supplied cast. Plan for exactly three six-second scenes with one spoken line each, stylized backgrounds and character pictograms; do not introduce extra characters or depend on new visual assets.",
  script:
    " Use exactly one dialogue line of at most 20 words per scene. Use only supplied cast IDs in dialogue and descriptions, reusing them when necessary, and brief grounded memory updates. No additional named characters. Keep the summary under 40 words. Convey the action through dialogue and the existing character pictograms, without requiring new props or artwork.",
  visual:
    " Choose visual properties only, in script order. Each scene should last 6 seconds. Use only character IDs that appear in the script dialogue; never invent IDs for extras or props. The application preserves original dialogue and scene IDs. Visuals use stylized CSS backgrounds and character pictograms, with no generated props, text signs or extra artwork.",
  critic:
    " Be concise. Each assessment must be under 30 words. Give at most three brief actionable feedback items. Do not retell the story or rewrite dialogue. Evaluate the actual player: exactly three six-second scenes, one short spoken line per scene, approved CSS backgrounds and supplied cast pictograms. Props, signs and extras are not rendered; their absence alone is not a defect when dialogue conveys the story. Never request additional scenes, extra characters or unsupported visual assets. Still reject continuity contradictions, ungrounded memories, unclear dialogue or an unfaithful winning choice.",
};
export function scriptRequest(input: ScriptInput) {
  const extended = input as ScriptInput & { base?: string; feedback?: unknown };
  const context = extended.base ? JSON.parse(extended.base).context : undefined;
  return {
    input: input.input,
    concept: input.concept,
    feedback: extended.feedback,
    context: context && {
      world: context.world,
      characters: context.characters,
      history: (context.approvedHistory || []).map(
        (episode: { script?: { summary?: string } }) => episode.script?.summary,
      ),
    },
  };
}
export function assembleManifest(
  plan: z.infer<typeof visualContract>,
  script: ScriptOutput,
) {
  return Manifest.parse({
    title: plan.title,
    scenes: plan.scenes.map((scene, index) => ({
      ...scene,
      id: script.scenes[index].id,
      dialogue: script.scenes[index].dialogue,
      characters: [
        ...new Set([
          ...scene.characters,
          ...script.scenes[index].dialogue.map((line) => line.characterId),
        ]),
      ],
    })),
  });
}
export function reviewRequest(input: ReviewInput) {
  const extended = input as ReviewInput & { base?: string; concept?: unknown };
  const base = extended.base ? JSON.parse(extended.base) : {};
  const context = base.context || {};
  return {
    input: base.input,
    concept: extended.concept,
    world: context.world,
    characters: context.characters,
    history: (context.approvedHistory || []).map(
      (episode: { script?: { summary?: string } }) => episode.script?.summary,
    ),
    script: input.script,
    manifest: input.manifest,
  };
}
