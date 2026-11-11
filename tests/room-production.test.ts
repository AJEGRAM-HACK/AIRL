import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { LiveStore } from '../src/server/live/store';
import { RoomJobs, runRoomJob } from '../src/server/production/room-jobs';
import { DemoCreativeProvider } from '../src/ai/providers/creative';
import { compositionFrames, sceneAtFrame, FPS } from '../src/video/composition';
import { backgrounds, characterAssets } from '../src/video/assets';
function setup() {
  const directory=mkdtempSync(join(tmpdir(),'airl-loop-test-'));
  const path=join(directory,'room.sqlite');
  const live=new LiveStore(path);
  const operator=live.redeemOperatorCode(live.join(),live.issueOperatorCode());
  return {path,live,operator,cleanup(){live.dispose();rmSync(directory,{recursive:true,force:true});}};
}
test('winning vote produces exactly one private draft, then idempotent publication exposes its manifest',async()=>{
  const t=setup();
  try {
    const round=t.live.snapshot().roundId;
    t.live.vote(t.operator,round,'taho');
    t.live.closeRound(t.operator,round);
    t.live.closeRound(t.operator,round);
    const jobs=new RoomJobs(t.path);
    try {
      assert.equal(jobs.list('barangay-2099').length,1);
      assert.match(String(jobs.list('barangay-2099')[0].choice),/taho/);
      assert.equal(jobs.list('barangay-2099')[0].manifest,null);
      assert.equal(await runRoomJob(t.path),true);
      assert.equal(await runRoomJob(t.path),false);
      const draft=jobs.list('barangay-2099',true)[0];
      assert.equal(draft.status,'review');
      assert.ok(draft.manifest);
      assert.equal(jobs.list('barangay-2099')[0].manifest,null);
      assert.ok(draft.events.some(event=>event.stage==='Creative Critic'&&event.status==='succeeded'));
      const interrupted = new DatabaseSync(t.path);
      interrupted.prepare("UPDATE room_jobs SET status='running',lease_until=0 WHERE id=?").run(String(draft.id));
      interrupted.close();
      await runRoomJob(t.path);
      assert.equal(jobs.list('barangay-2099',true)[0].run_id,draft.run_id);
      jobs.action(String(draft.id),'publish');
      jobs.action(String(draft.id),'publish');
      const published=jobs.list('barangay-2099')[0];
      assert.equal(published.status,'published');
      assert.match(JSON.stringify(published.manifest),/taho/);
      assert.deepEqual(published.events,[]);
    } finally {jobs.close();}
  } finally {t.cleanup();}
});
test('rejected drafts remain private and expired claims can be recovered',async()=>{
  const t=setup();
  try {
    t.live.closeRound(t.operator,t.live.snapshot().roundId);
    const jobs=new RoomJobs(t.path);
    try {
      const first=jobs.claim();
      assert.ok(first);
      const other=new RoomJobs(t.path);
      try {assert.equal(other.claim(),undefined);}finally{other.close();}
      const raw=new DatabaseSync(t.path);
      raw.prepare('UPDATE room_jobs SET lease_until=? WHERE id=?').run(0,String(first!.id));raw.close();
      assert.equal(await runRoomJob(t.path),true);
      assert.equal(jobs.list('barangay-2099',true)[0].status,'review');
      jobs.action(String(first!.id),'reject');
      jobs.action(String(first!.id),'reject');
      assert.equal(jobs.list('barangay-2099')[0].manifest,null);
      assert.throws(()=>jobs.action(String(first!.id),'publish'));
    } finally{jobs.close();}
  } finally{t.cleanup();}
});
test('failed jobs retry within limits and invalid media cannot be published',async()=>{
  const t=setup();
  try {
    t.live.closeRound(t.operator,t.live.snapshot().roundId);
    const jobs=new RoomJobs(t.path);
    const raw=new DatabaseSync(t.path);
    try {
      const job=jobs.list('barangay-2099')[0];
      raw.prepare("UPDATE room_jobs SET status='failed',attempts=3 WHERE id=?").run(String(job.id));
      assert.throws(()=>jobs.action(String(job.id),'retry'));
      raw.prepare("UPDATE room_jobs SET attempts=1 WHERE id=?").run(String(job.id));
      jobs.action(String(job.id),'retry');jobs.action(String(job.id),'retry');
      await runRoomJob(t.path);
      const review=jobs.list('barangay-2099',true)[0];
      raw.prepare("UPDATE production_drafts SET artifact='{}' WHERE run_id=?").run(String(review.run_id));
      assert.throws(()=>jobs.action(String(job.id),'publish'));
      assert.equal(jobs.list('barangay-2099')[0].manifest,null);
    } finally{raw.close();jobs.close();}
  } finally{t.cleanup();}
});
test('composition timing, assets and dialogue match the chosen manifest',async()=>{
  const provider=new DemoCreativeProvider();
  const input={roomId:'barangay-2099' as const,winningChoice:'Karaoke night'};
  const script=await provider.generateScript({input,concept:await provider.generateStory(input)});
  const manifest=await provider.generateScenes(script);
  assert.equal(compositionFrames(manifest),18*FPS);
  assert.equal(sceneAtFrame(manifest,0).scene.id,'scene-1');
  assert.equal(sceneAtFrame(manifest,6*FPS).scene.id,'scene-2');
  assert.equal(sceneAtFrame(manifest,12*FPS).scene.id,'scene-3');
  for(const scene of manifest.scenes){assert.ok(backgrounds[scene.background]);for(const id of scene.characters)assert.ok(characterAssets[id]);}
  assert.match(manifest.scenes[0].dialogue[0].text,/Karaoke/);
});
