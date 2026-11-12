import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ProductionStore } from '../src/server/production/store';
import { produce, safeFailure, type Executor } from '../src/server/production/workflow';
import { type Stage } from '../src/server/production/schemas';
const input = { roomId: 'barangay-2099' as const, winningChoice: 'Launch a mandatory karaoke night' };
function outputs() {
  const script = { title: 'Karaoke protocol', summary: 'A local test fixture, never live production.', scenes: [1,2,3].map(n => ({ id: `scene-${n}`, description: 'Test scene', dialogue: [{ characterId: 'captain-bot', text: 'Karaoke protocol activated.' }] })), memoryUpdates: [{characterId: 'captain-bot', memory: 'Announced a karaoke protocol.'}] };
  return { 'Story Director': { title: 'Karaoke protocol', premise: 'Karaoke night', conflict: 'Too many singers', humor: 'Bot sings', cliffhanger: 'Power outage' }, Screenwriter: script, 'Visual Producer': { title: script.title, scenes: script.scenes.map(s => ({ id: s.id, style: 'character-dialogue', background: 'barangay-plaza', characters: ['captain-bot'], animation: 'fade-in', durationSeconds: 5, dialogue: s.dialogue })) }, 'Creative Critic': { approved: true, continuity: 'test', characterVoice: 'test', visualFeasibility: 'test', feedback: [] } };
}
function setup() { const dir = mkdtempSync(join(tmpdir(), 'cinemai-test-')); const path = join(dir, 'test.sqlite'); const store = new ProductionStore(path); return {store, path, cleanup() { store.close(); rmSync(dir, { recursive: true, force: true }); }}; }
function executor(override?: (stage: Stage, count: number) => unknown): Executor {
  const counts = new Map<Stage, number>();
  return { async preflight() {}, async execute(stage) { const count = (counts.get(stage)||0)+1; counts.set(stage,count); return override ? override(stage,count) : outputs()[stage]; } };
}
test('four typed stages persist outputs and approved continuity across database reopen (test doubles)', async () => {
  const t = setup();
  try {
    const result = await produce(t.store, executor(), input, 'test-model');
    assert.equal(result.status, 'complete');
    const reopened = new ProductionStore(t.path);
    try {
      const saved = reopened.inspect(result.id);
      assert.equal(saved.production?.status, 'complete');
      assert.equal(saved.events.filter(e=>e.status==='succeeded').length, 5);
      assert.ok(saved.episode);
      const context = reopened.context(input.roomId);
      assert.equal(context.approvedHistory.length, 1);
      assert.ok(context.characters.find(c=>c.id==='captain-bot')?.memories.includes('Announced a karaoke protocol.'));
    } finally { reopened.close(); }
  } finally { t.cleanup(); }
});
test('critic rejection gets one revision then human review, without canonical memory changes', async () => {
  const t=setup();
  try {
    const result = await produce(t.store, executor(stage=>stage==='Creative Critic'?{...outputs()[stage],approved:false,feedback:['Revise continuity']}:outputs()[stage]), input, 'test-model');
    assert.equal(result.status,'review');
    const saved=t.store.inspect(result.id);
    assert.equal(saved.events.filter(e=>e.stage==='Screenwriter'&&e.status==='succeeded').length,2);
    assert.equal(saved.episode,undefined);
    assert.equal(t.store.context(input.roomId).approvedHistory.length,0);
  } finally {t.cleanup();}
});
test('schema failures retry once and retain failure evidence',async()=>{
  const t=setup();let id='';
  try {
    await assert.rejects(produce(t.store,executor(()=>({})),input,'test-model',value=>{id=value;}));
    const saved=t.store.inspect(id);
    assert.equal(saved.production?.status,'failed');
    assert.equal(saved.events.filter(e=>e.stage==='Story Director'&&e.status==='failed').length,2);
    assert.equal(saved.episode,undefined);
  } finally {t.cleanup();}
});
test('manifest dialogue mismatch is rejected before critic and publication',async()=>{
  const t=setup();let id='';
  try {
    await assert.rejects(produce(t.store,executor(stage=>{const values=outputs();if(stage==='Visual Producer') values[stage].scenes[0].dialogue[0].text='Changed dialogue';return values[stage];}),input,'test-model',value=>{id=value;}));
    const saved=t.store.inspect(id);
    assert.equal(saved.production?.status,'failed');
    assert.equal(saved.events.some(e=>e.stage==='Creative Critic'),false);
    assert.equal(saved.episode,undefined);
  } finally {t.cleanup();}
});
test('model access failure stops before any agent call and sanitizes error details',async()=>{
  const t=setup();let id='';let called=false;
  try {
    await assert.rejects(produce(t.store,{async preflight(){throw {status:403,message:'secret-value'};},async execute(){called=true;}},input,'test-model',value=>{id=value;}));
    assert.equal(called,false);
    const saved=t.store.inspect(id);
    assert.equal(saved.production?.status,'failed');
    assert.equal(JSON.stringify(saved).includes('secret-value'),false);
    assert.deepEqual(safeFailure({status:403,message:'secret'}),{code:'model_access_failed',httpStatus:403});
  } finally {t.cleanup();}
});
test('one active run per room prevents overlapping continuity writes',()=>{
  const t=setup();
  try {const id=t.store.create(input,'test-model');assert.throws(()=>t.store.create(input,'test-model'));t.store.finish(id,'failed');assert.ok(t.store.create(input,'test-model'));} finally {t.cleanup();}
});

test('snapshot retries reuse completed stages when input properties arrive in a different order', async () => {
  const t = setup();
  let id = '';
  const snapshot = t.store.context(input.roomId);
  const requested = { ...input, universeId: input.roomId, snapshot };
  try {
    await assert.rejects(produce(t.store, executor(stage => {
      if (stage === 'Creative Critic') throw new Error('Test transport interruption');
      return outputs()[stage];
    }), requested, 'test-model', runId => { id = runId; }, true));
    const reordered = { winningChoice: input.winningChoice, snapshot, universeId: input.roomId, roomId: input.roomId };
    const resume = t.store.resumable(id, reordered, 'test-model', 'openai');
    assert.equal((resume.script as { title: string }).title, 'Karaoke protocol');
    assert.equal((resume.manifest as { scenes: unknown[] }).scenes.length, 3);
    assert.deepEqual(t.store.resumable(id, { ...reordered, winningChoice: 'Different direction' }, 'test-model', 'openai'), {});
  } finally { t.cleanup(); }
});

test('a Critic transport failure preserves a playable private preview and compatible retries reuse validated stages', async () => {
  const t = setup();
  let failedId = '';
  try {
    await assert.rejects(produce(t.store, executor(stage => {
      if (stage === 'Creative Critic') throw new Error('transport failure');
      return outputs()[stage];
    }), input, 'test-model', id => { failedId = id; }, true));
    const preview = t.store.preview(failedId);
    assert.equal(preview.version, 1);
    assert.equal(preview.manifest.scenes.length, 3);
    assert.equal(preview.script.title, 'Karaoke protocol');
    assert.equal(t.store.inspect(failedId).episode, undefined);
    assert.deepEqual(t.store.resumable(failedId, input, 'different-model', 'openai'), {});
    assert.deepEqual(t.store.resumable(failedId, {...input, winningChoice: 'Changed'}, 'test-model', 'openai'), {});
    const resume = t.store.resumable(failedId, input, 'test-model', 'openai');
    const calls: Stage[] = [];
    const result = await produce(t.store, executor(stage => {
      calls.push(stage);
      return outputs()[stage];
    }), input, 'test-model', undefined, true, resume);
    assert.equal(result.status, 'review');
    assert.deepEqual(calls, ['Creative Critic']);
    assert.ok(t.store.preview(failedId).manifest);
  } finally { t.cleanup(); }
});
