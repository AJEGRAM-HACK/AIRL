import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Bot, Glasses, Coffee, UserRound } from 'lucide-react';
import { z } from 'zod';
import { Manifest } from '@/server/production/schemas';
import { backgrounds, characterAssets } from './assets';
export type EpisodeManifest = z.infer<typeof Manifest>;
export const FPS = 30;
export function compositionFrames(manifest: EpisodeManifest) { return manifest.scenes.reduce((total,scene) => total + scene.durationSeconds * FPS,0); }
export function sceneAtFrame(manifest: EpisodeManifest, frame: number) {
  let start = 0;
  for (const scene of manifest.scenes) {
    if (frame < start + scene.durationSeconds * FPS) return { scene, start };
    start += scene.durationSeconds * FPS;
  }
  return { scene: manifest.scenes[manifest.scenes.length-1], start };
}
function Scene({ scene, captions, reducedMotion, cast }: { cast?:EpisodeManifest['cast']; reducedMotion: boolean; scene: EpisodeManifest['scenes'][number]; captions: boolean }) {
  const assetFor=(id:string)=>cast?.find(character=>character.id===id)||characterAssets[id]||{name:id,color:'#a78bfa',symbol:'person'};
  const frame = useCurrentFrame();
  const duration = scene.durationSeconds * FPS;
  const opacity = reducedMotion ? 1 : interpolate(frame,[0,12,duration-10,duration],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const palette = backgrounds[scene.background];
  const index = Math.min(scene.dialogue.length-1,Math.floor(frame / duration * scene.dialogue.length));
  const line = scene.dialogue[index];
  const zoom = !reducedMotion && scene.style === 'dramatic-reveal' ? 1 + frame / duration * .1 : 1;
  return <AbsoluteFill data-scene-id={scene.id} style={{ background: palette.sky, color:'#f5f3ff',fontFamily:'Arial, sans-serif' }}>
    <AbsoluteFill style={{ opacity, background:`radial-gradient(ellipse at 70% 25%,${palette.glow},transparent 65%)`,transform:`scale(${zoom})` }}>
      <div style={{ position:'absolute',top:100,right:85,width:140,height:140,borderRadius:'50%',background:'#f5d4ff',opacity:.55 }}/>
      {[0,1,2,3,4].map(item => <div key={item} style={{position:'absolute',bottom:320,left:item*160-20,width:130,height:220+item%3*90,background:palette.floor,border:'2px solid #a78bfa44'}}><div style={{margin:20,height:90,background:'repeating-linear-gradient(90deg,#bfa7df33 0 15px,transparent 15px 25px)'}}/></div>)}
      <div style={{position:'absolute',bottom:0,height:330,width:'100%',background:palette.floor}}/>
    </AbsoluteFill>
    <div style={{padding:'65px 50px',letterSpacing:6,fontSize:20,color:'#d9c6ee'}}>BARANGAY 2099</div>
    <div style={{position:'absolute',top:140,left:50,right:50,fontSize:38,fontWeight:700,lineHeight:1.15}}>{palette.label}</div>
    <div style={{position:'absolute',top:320,left:35,right:35,display:'flex',justifyContent:'center',gap:15,alignItems:'end'}}>
      {scene.characters.map(id => {
        const asset = assetFor(id);
        const Icon = asset.symbol==='bot'?Bot:asset.symbol==='glasses'||id==='tita-nena'?Glasses:asset.symbol==='coffee'||id==='kuya-taho'?Coffee:UserRound;
        const shift = !reducedMotion && scene.animation === 'slide-in' ? interpolate(frame,[0,20],[100,0],{extrapolateRight:'clamp'}) : 0;
        const bob = !reducedMotion && (scene.animation === 'gentle-bob' || scene.style === 'reaction-comedy') ? Math.sin(frame/8)*8 : 0;
        return <div key={id} style={{width:200,textAlign:'center',transform:`translate(${shift}px,${bob}px)`,color:asset.color}}><div style={{height:250,borderRadius:'80px 80px 35px 35px',background:palette.floor,border:`3px solid ${asset.color}`,display:'grid',placeItems:'center',boxShadow:`0 0 50px ${asset.color}33`}}><Icon size={100} strokeWidth={1.4}/></div><div style={{fontSize:20,fontWeight:700,marginTop:22}}>{asset.name}</div></div>;
      })}
    </div>
    {scene.style === 'news-broadcast' && <div style={{position:'absolute',top:250,left:50,background:'#8b5cf6',padding:'10px 22px',fontSize:22,fontWeight:700}}>BARANGAY BULLETIN</div>}
    {captions && line && <div style={{position:'absolute',bottom:160,left:40,right:40,textAlign:'center',background:'#0d0d17ed',padding:28,borderRadius:18,border:'1px solid #ffffff33'}}><div style={{fontSize:23,color:assetFor(line.characterId).color,marginBottom:12}}>{assetFor(line.characterId).name}</div><div style={{fontSize:32,lineHeight:1.4}}>{line.text}</div></div>}
    {scene.style === 'cliffhanger' && <div style={{position:'absolute',bottom:95,width:'100%',textAlign:'center',fontSize:20,letterSpacing:5,color:'#e879f9'}}>TO BE CONTINUED…</div>}
  </AbsoluteFill>;
}

function CinematicScene({ scene, captions, reducedMotion, cast, title, sceneIndex }: {
  scene: EpisodeManifest['scenes'][number];
  captions: boolean;
  reducedMotion: boolean;
  cast: NonNullable<EpisodeManifest['cast']>;
  title: string;
  sceneIndex: number;
}) {
  const frame = useCurrentFrame();
  const duration = scene.durationSeconds * FPS;
  const lineIndex = Math.min(scene.dialogue.length - 1, Math.floor(frame / duration * scene.dialogue.length));
  const line = scene.dialogue[lineIndex];
  const speaker = cast.find(character => character.id === line?.characterId);
  const zoom = reducedMotion ? 1 : interpolate(frame, [0, duration], [1.025, 1.095]);
  const pan = reducedMotion ? 0 : interpolate(frame, [0, duration], [sceneIndex === 1 ? -9 : 8, sceneIndex === 1 ? 9 : -8]);
  return <AbsoluteFill data-scene-id={scene.id} style={{ background: '#06152c', color: '#f4f9ff', fontFamily: 'Schibsted Grotesk, Arial, sans-serif' }}>
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img src={staticFile('images/barangay-2099-cinematic.png')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom}) translateX(${pan}px)` }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(3,13,31,.7), transparent 36%, transparent 52%, rgba(3,13,31,.95) 88%)' }} />
      <AbsoluteFill style={{ boxShadow: 'inset 0 0 130px rgba(0,10,28,.55)' }} />
    </AbsoluteFill>
    <div style={{ position: 'absolute', top: 62, left: 46, right: 46 }}>
      <p style={{ color: '#9edcff', fontSize: 21, letterSpacing: 4, margin: 0 }}>BARANGAY 2099</p>
      {sceneIndex === 0
        ? <div style={{ fontSize: 53, fontWeight: 750, lineHeight: 1.06, letterSpacing: -2, maxWidth: 590, margin: '22px 0 0', textShadow: '0 4px 30px #051128' }}>{title}</div>
        : <p style={{ fontSize: 29, color: '#e5f2ff', margin: '18px 0 0' }}>{backgrounds[scene.background].label}</p>}
    </div>
    {captions && line && <div style={{ position: 'absolute', bottom: 240, left: 38, right: 38, padding: '27px 30px 30px', borderRadius: 22, background: 'linear-gradient(135deg, rgba(7,28,56,.96), rgba(5,18,39,.97))', border: '1px solid #98d8ff55', boxShadow: '0 18px 65px #020b1bc0' }}>
      <p style={{ fontSize: 30, fontWeight: 700, margin: '0 0 13px', color: '#a4deff' }}>{speaker?.name || line.characterId}</p>
      <p style={{ fontSize: 40, lineHeight: 1.35, fontWeight: 550, margin: 0, color: '#f6faff' }}>{line.text}</p>
      <div aria-hidden="true" style={{ display: 'flex', gap: 7, marginTop: 23 }}>{scene.dialogue.map((_, index) => <i key={index} style={{ height: 3, flex: 1, background: index <= lineIndex ? '#8edaff' : '#6b8daa44', borderRadius: 4 }} />)}</div>
    </div>}
    {scene.style === 'cliffhanger' && <p style={{ position: 'absolute', bottom: 60, width: '100%', textAlign: 'center', color: '#9edcff', fontSize: 18, letterSpacing: 5, margin: 0 }}>TO BE CONTINUED</p>}
  </AbsoluteFill>;
}

export function EpisodeComposition({ manifest, captions = true, reducedMotion = false }: { manifest: EpisodeManifest; captions?: boolean; reducedMotion?: boolean }) {
  let from = 0;
  const cinematic = manifest.cast?.length === 3 && Object.entries(characterAssets).every(([id, character]) => manifest.cast?.some(item => item.id === id && item.name === character.name));
  return <AbsoluteFill style={{background:'#0d0d17'}}>{manifest.scenes.map((scene, sceneIndex) => {
    const start = from;
    from += scene.durationSeconds * FPS;
    return <Sequence key={scene.id} from={start} durationInFrames={scene.durationSeconds * FPS}>{cinematic
      ? <CinematicScene cast={manifest.cast!} title={manifest.title} sceneIndex={sceneIndex} scene={scene} captions={captions} reducedMotion={reducedMotion}/>
      : <Scene cast={manifest.cast} scene={scene} captions={captions} reducedMotion={reducedMotion}/>}</Sequence>;
  })}</AbsoluteFill>;
}
