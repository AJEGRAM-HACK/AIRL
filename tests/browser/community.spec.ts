import { test, expect } from '@playwright/test';
import { LiveStore } from '../../src/server/live/store';
for (const mode of ['demo','ollama'] as const) test(`${mode} audience votes become an approved episode with real browser playback`,async({browser})=>{
  const initial = new LiveStore(process.env.AIRL_LIVE_DB_PATH);
  try { if (initial.snapshot().status === 'closed') { const token=initial.redeemOperatorCode(initial.join(),initial.issueOperatorCode());initial.nextRound(token,initial.snapshot().roundId); } } finally { initial.dispose(); }
  const contextA=await browser.newContext({viewport:{width:390,height:844}});
  const contextB=await browser.newContext({viewport:{width:390,height:844}});
  const operatorContext=await browser.newContext();
  const a=await contextA.newPage(),b=await contextB.newPage(),operator=await operatorContext.newPage();
  const errors:string[]=[];
  for(const page of [a,b,operator])page.on('pageerror',error=>errors.push(error.message));
  try {
    for(const page of [a,b]){
      await page.goto('/live/barangay-2099');
      await page.getByRole('link',{name:'Vote on next chapter'}).click();
      await expect(page.getByRole('button',{name:/Join room to vote/})).toBeInViewport();
      await page.getByRole('button',{name:/Join room to vote/}).click();
    }
    await a.getByRole('radio',{name:mode==='demo'?/Declare taho/:/Launch a mandatory karaoke/}).check();
    await a.getByRole('button',{name:'Cast my vote'}).click();
    await b.getByRole('radio',{name:/Send Captain Bot offline/}).check();
    await b.getByRole('button',{name:'Cast my vote'}).click();
    await expect(a.locator('.community-stats')).toContainText('2 votes');
    await expect(b.locator('.community-stats')).toContainText('2 votes');
    await operator.goto('/studio/barangay-2099');
    await operator.getByRole('button',{name:/Join room to vote/}).click();
    await expect(operator.getByRole('button',{name:/Join room to vote/})).toHaveCount(0);
    const store=new LiveStore(process.env.AIRL_LIVE_DB_PATH);
    let code:string;try{code=store.issueOperatorCode();}finally{store.dispose();}
    await operator.getByLabel('One-time operator code').fill(code);
    await operator.getByRole('button',{name:'Unlock controls'}).click();
    await operator.getByLabel('Production provider',{exact:true}).selectOption(mode);
    if(mode==='ollama')await operator.getByLabel('Production model',{exact:true}).fill('qwen3:4b-instruct');
    await operator.getByRole('button',{name:'Close voting & produce',exact:true}).first().click();
    const latencies:number[]=[];
    let job:any;
    const started=Date.now();
    while(Date.now()-started<130000){
      const response=await operator.request.get('/api/production?operator=1');
      const data=await response.json();job=data.jobs[0];
      if(job?.status==='failed')throw new Error('Production failed: '+JSON.stringify(job.events));
      if(job?.status==='review')break;
      const before=Date.now();await a.request.get('/api/live/rooms/barangay-2099/state');latencies.push(Date.now()-before);
      await operator.waitForTimeout(500);
    }
    expect(job?.status).toBe('review');expect(job.mode).toBe(mode);
    expect(job.manifest.scenes).toHaveLength(3);
    if(mode==='ollama'){expect(job.choice).toMatch(/karaoke/i);expect(JSON.stringify(job.manifest)).toMatch(/karaoke|kanta|birit/i);}
    const resident = mode==='ollama' ? await (await fetch('http://127.0.0.1:11434/api/ps')).json() : null;
    if(resident){expect(resident.models).toHaveLength(1);console.log('Local model residency',JSON.stringify(resident.models.map((model:any)=>({model:model.name,bytes:model.size_vram,context:model.context_length}))));}
    console.log(mode+' production seconds',((Date.now()-started)/1000).toFixed(1),'max audience API milliseconds',Math.max(0,...latencies));
    if(latencies.length)expect(Math.max(...latencies)).toBeLessThan(3000);
    await expect(operator.getByRole('button',{name:'Approve & publish'})).toBeVisible();
    await expect(operator.locator('.provider-timeline')).toContainText('Creative Critic');
    await operator.getByRole('button',{name:'Approve & publish'}).click();
    await expect(a.locator('.episode-meta .eyebrow')).toContainText(mode,{timeout:15000});
    await expect(a.locator('.room-production .remotion-preview')).toBeVisible({timeout:15000});
    const preview=a.locator('.room-production .remotion-preview');
    await preview.getByRole('button',{name:'Play video',exact:true}).click();
    await expect.poll(async()=>Number(await preview.getAttribute('data-frame'))).toBeGreaterThan(15);
    await preview.getByRole('button',{name:'Pause video',exact:true}).click();
    await preview.getByRole('slider',{name:'Seek episode'}).fill(String(job.manifest.scenes[0].durationSeconds*30+20));
    await expect(preview).toHaveAttribute('data-frame',String(job.manifest.scenes[0].durationSeconds*30+20));
    await expect(preview.getByText(job.manifest.scenes[1].dialogue[0].text,{exact:true}).first()).toBeVisible();
    await preview.getByRole('slider',{name:'Seek episode'}).fill(String((job.manifest.scenes[0].durationSeconds+job.manifest.scenes[1].durationSeconds)*30+20));
    await expect(preview.getByText(job.manifest.scenes[2].dialogue[0].text,{exact:true}).first()).toBeVisible();
    await preview.getByLabel('Captions',{exact:true}).uncheck();
    await expect(preview.getByText(job.manifest.scenes[2].dialogue[0].text,{exact:true}).first()).not.toBeVisible();
    await preview.getByLabel('Captions',{exact:true}).check();
    await expect(preview.getByText(job.manifest.scenes[2].dialogue[0].text,{exact:true}).first()).toBeVisible();
    await a.screenshot({path:`/tmp/airl-${mode}-audience.png`,fullPage:true});
    await a.getByRole('combobox',{name:'Episode library',exact:true}).selectOption('ep-01');
    await expect(a.locator('.episode-meta .eyebrow')).toHaveText('SEEDED REFERENCE EPISODE');
    await a.getByRole('combobox',{name:'Episode library',exact:true}).selectOption(job.id);
    await expect(a.locator('.episode-meta .eyebrow')).toContainText(mode);
    if(mode==='ollama'){
      const memory = new (await import('../../src/server/production/store')).ProductionStore(process.env.AIRL_LIVE_DB_PATH!);
      let artifact:any;try{artifact=memory.draft(job.run_id);}finally{memory.close();}
      expect(artifact.script.memoryUpdates.length).toBeGreaterThan(0);
      const update=artifact.script.memoryUpdates[0];
      await b.goto(`/persona/${update.characterId}`);
      await expect(b.getByText(update.memory,{exact:true}).first()).toBeVisible();
    }
    expect(await a.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
    await expect(a.locator('a.skip-link')).not.toBeInViewport();
    expect(errors).toEqual([]);
  }finally{await contextA.close();await contextB.close();await operatorContext.close();}
});

test('a delayed anonymous session read cannot undo a successful room join', async ({ page }) => {
  let delayed: import('@playwright/test').Route | undefined;
  await page.route('**/api/live/session', async route => {
    if (route.request().method() === 'GET' && !delayed) { delayed = route; return; }
    await route.continue();
  });
  await page.goto('/live/barangay-2099');
  await expect.poll(() => !!delayed).toBe(true);
  await page.getByRole('button', { name: /Join room to vote/ }).click();
  await expect(page.getByRole('button', { name: 'Cast my vote', exact: true })).toBeVisible();
  const response = page.waitForResponse(value => value.url().endsWith('/api/live/session') && value.request().method() === 'GET');
  await delayed!.fulfill({ json: { joined: false, operator: false, vote: null } });
  await response;
  await expect(page.getByRole('button', { name: 'Cast my vote', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Join room to vote/ })).toHaveCount(0);
});
