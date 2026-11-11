import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Worker } from 'node:worker_threads';
import { mkdtempSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join,resolve } from 'node:path';
import { LiveStore } from '../src/server/live/store';
import { RoomJobs,runRoomJob } from '../src/server/production/room-jobs';
import { ProductionStore } from '../src/server/production/store';
import { DemoCreativeProvider } from '../src/ai/providers/creative';
import { canonicalCharacters } from '../src/ai/memory/canonical';
import { characterPrompt } from '../src/ai/prompts/character';
async function setupDraft(){
 const directory=mkdtempSync(join(tmpdir(),'airl-sprint-')),path=join(directory,'db.sqlite');
 const live=new LiveStore(path),operator=live.redeemOperatorCode(live.join(),live.issueOperatorCode());
 live.closeRound(operator,live.snapshot().roundId);await runRoomJob(path);
 const jobs=new RoomJobs(path);const draft=jobs.list('barangay-2099',true)[0];
 return{directory,path,live,operator,jobs,draft,cleanup(){live.dispose();jobs.close();rmSync(directory,{recursive:true,force:true});}};
}
test('simultaneous independent-worker approval/rejection has one final decision',async()=>{
 const t=await setupDraft();
 try{
  const barrier=new SharedArrayBuffer(4),state=new Int32Array(barrier);
  const workerCode=`require('tsx/cjs');const{parentPort,workerData}=require('node:worker_threads');const{RoomJobs}=require(workerData.module);const jobs=new RoomJobs(workerData.path);parentPort.postMessage('ready');Atomics.wait(new Int32Array(workerData.barrier),0,0);try{jobs.action(workerData.id,workerData.action);parentPort.postMessage('ok')}catch{parentPort.postMessage('conflict')}finally{jobs.close()}`;
  const workers=['publish','reject'].map(action=>new Worker(workerCode,{eval:true,workerData:{action,barrier,path:t.path,id:t.draft.id,module:resolve('src/server/production/room-jobs.ts')}}));
  const ready=workers.map(worker=>new Promise<void>((done,reject)=>{worker.once('message',()=>done());worker.once('error',reject);}));
  await Promise.all(ready);Atomics.store(state,0,1);Atomics.notify(state,0);
  const results=await Promise.all(workers.map(worker=>new Promise<string>((done,reject)=>{worker.once('message',done);worker.once('error',reject);})));
  assert.equal(results.filter(result=>result==='ok').length,1);
  const final=t.jobs.list('barangay-2099')[0];assert.ok(['published','rejected'].includes(final.status));
  if(final.status==='published'){assert.throws(()=>t.jobs.action(final.id,'reject'));assert.ok(final.manifest);}
  else{assert.throws(()=>t.jobs.action(final.id,'publish'));assert.equal(final.manifest,null);}
  await Promise.all(workers.map(worker=>worker.terminate()));
 }finally{t.cleanup();}
});
test('approved memories reach all personas and the next production; drafts and rejects stay private',async()=>{
 const t=await setupDraft();const old=process.env.AIRL_LIVE_DB_PATH;process.env.AIRL_LIVE_DB_PATH=t.path;
 const store=new ProductionStore(t.path);
 try{
  const artifact=store.draft(t.draft.run_id!);
  const updates=['captain-bot','tita-nena','kuya-taho'].map(characterId=>({characterId,memory:`${characterId} witnessed the approved taho council.`}));
  // Model-free fixture adds facts explicitly established in the test script.
  artifact.script.memoryUpdates=updates;
  artifact.script.scenes[0].dialogue[0].text = updates.map(update=>update.memory).join(' ');
  artifact.manifest.scenes[0].dialogue = artifact.script.scenes[0].dialogue;
  const {DatabaseSync}=await import('node:sqlite');const db=new DatabaseSync(t.path);
  db.prepare('UPDATE production_drafts SET artifact=? WHERE run_id=?').run(JSON.stringify(artifact),t.draft.run_id);db.close();
  assert.equal(canonicalCharacters(t.path)[0].memories.some(memory=>memory.includes('approved taho council')),false);
  t.jobs.action(t.draft.id,'publish');
  for(const update of updates){
   assert.ok(canonicalCharacters(t.path).find(character=>character.id===update.characterId)!.memories.includes(update.memory));
   assert.ok(characterPrompt({characterId:update.characterId as 'captain-bot',message:'What do you remember?'}).includes(update.memory));
   assert.ok((await new DemoCreativeProvider().generateCharacterReply({characterId:update.characterId as 'captain-bot',message:'remember'})).text.includes(update.memory));
  }
  assert.equal(store.context('barangay-2099','ollama',true).approvedHistory.length,1);
  t.live.nextRound(t.operator,t.draft.round_id);t.live.closeRound(t.operator,t.live.snapshot().roundId);await runRoomJob(t.path);
  const next=t.jobs.list('barangay-2099',true).find(job=>job.id!==t.draft.id)!;
  t.jobs.action(next.id,'reject');assert.equal(store.context('barangay-2099','ollama',true).approvedHistory.length,1);
 }finally{store.close();if(old===undefined)delete process.env.AIRL_LIVE_DB_PATH;else process.env.AIRL_LIVE_DB_PATH=old;t.cleanup();}
});
test('background BYOK is rejected and hosted jobs require explicit server enablement',async()=>{
 const t=await setupDraft();
 try{
  const {RoomProviderSelection}=await import('../src/features/live/production-selection');
  assert.equal(RoomProviderSelection.safeParse({mode:'creator_byok',apiKey:'synthetic-test-key'}).success,false);
  t.live.nextRound(t.operator,t.draft.round_id);
  assert.throws(()=>t.live.closeRound(t.operator,t.live.snapshot().roundId,{mode:'hosted_openai',consent:false}));
 }finally{t.cleanup();}
});
