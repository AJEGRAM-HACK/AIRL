'use client';
import { useAccess } from '@/components/platform/access';
import { ProviderPreview } from './provider-preview';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { characters } from '@/features/persona/characters';
import type { Mode } from '@/ai/schemas/gateway';
const labels: Record<Mode, string> = { demo: 'Demo', ollama: 'Local Ollama', hosted_openai: 'AIRL Hosted OpenAI', creator_byok: 'Creator BYOK · OpenAI' };
export function ProviderSettings({ initialCharacter }: { initialCharacter?: string }) {
  const permissions=useAccess();
  const [mode, setMode] = useState<Mode>('demo');
  const [model, setModel] = useState('');
  const [key, setKey] = useState('');
  const [consent, setConsent] = useState(false);
  const [characterId, setCharacter] = useState(characters.some(item => item.id === initialCharacter) ? initialCharacter! : characters[0].id);
  const [message, setMessage] = useState('Introduce yourself.');
  const [choice, setChoice] = useState('Ban Monday meetings');
  const [access, setAccess] = useState(false);
  const [loaded,setLoaded]=useState(false);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState('Connection has not been tested.');
  const [output, setOutput] = useState<unknown>(null);
  const [usage, setUsage] = useState<unknown[]>([]);
  const controller = useRef<AbortController | null>(null);
  async function refresh() {
    try {
      const response = await fetch('/api/ai', { cache: 'no-store' });
      if (!response.ok) { setAccess(false); return; }
      const data = await response.json(); setAccess(true); setUsage(data.usage);
    } catch { setAccess(false);setStatus('Unable to load provider access.'); } finally {setLoaded(true);}
  }
  useEffect(() => {
    if(permissions.canCreate)void refresh();
    return () => { controller.current?.abort(); };
  }, [permissions.canCreate]);
  function disconnect() {
    controller.current?.abort(); controller.current = null;
    setKey(''); setConsent(false); setOutput(null); setStatus('Disconnected. Credentials cleared from this page.'); setPending(false);
  }
  async function run(operation: 'test' | 'generate' | 'reply') {
    setPending(true); setOutput(null); setStatus('Request running…');
    const current = new AbortController(); controller.current = current;
    try {
      const response = await fetch('/api/ai', { method: 'POST', signal: current.signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode, ...(model.trim() ? { model: model.trim() } : {}), ...(mode === 'creator_byok' ? { apiKey: key } : {}), consent, operation, choice, reply: { characterId, message } }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'Provider request failed.');
      if (controller.current === current) { setOutput(data); setStatus(`${labels[mode]} request completed using ${data.model}.`); }
    } catch (error) {
      if (!current.signal.aborted) setStatus(error instanceof Error ? error.message : 'Request failed.');
    } finally {
      if (controller.current === current) { setPending(false); controller.current = null; }
      if(permissions.canCreate)void refresh();
    }
  }
  const paid = mode === 'hosted_openai' || mode === 'creator_byok';
  if(!permissions.canCreate)return null;
  if(!loaded)return <p role="status">Loading provider settings…</p>;
  if(!access)return <p><Link href="/account">Sign in</Link> with creator access to open provider settings.</p>;
  return <div className="provider-settings">

    <section className="panel provider-form"><h2>Provider settings</h2><p>Provider selections and creator credentials live in this page’s memory. Changing provider clears the credential.</p>
      <fieldset disabled={pending}><label htmlFor="provider-mode">Execution mode</label><select id="provider-mode" value={mode} onChange={event => { disconnect(); setMode(event.target.value as Mode); setModel(''); }}>{Object.entries(labels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>
      {mode !== 'demo' && <><label htmlFor="provider-model">Model identifier {mode === 'ollama' ? '(leave empty to use an installed model)' : ''}</label><input id="provider-model" value={model} onChange={event => { setModel(event.target.value); setStatus('Model changed. Test the connection again.'); }} maxLength={100}/></>}
      {mode === 'creator_byok' && <><label htmlFor="provider-key">Session-only OpenAI API key</label><input id="provider-key" type="password" autoComplete="off" spellCheck={false} value={key} onChange={event => setKey(event.target.value)} maxLength={256}/><p>HTTPS is required. Keys are used only for this request and are cleared when you leave or disconnect. Background BYOK is unavailable.</p></>}
      {paid && <label className="provider-consent"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)}/> I authorize paid inference with this selected credential for each action I run.</label>}
      <p>Structured outputs · Sequential steps · 110-second request limit · No automatic provider fallback</p>
      </fieldset><div className="provider-actions"><Button disabled={!access || pending || (paid && !consent)} onClick={() => run('test')}>Test connection with inference</Button><Button variant="outline" onClick={disconnect}>Disconnect & clear</Button></div><p role="status">{status}</p>
    </section>
    <div className="provider-work-grid"><section className="panel provider-form"><h2>Creative workflow preview</h2><p>Runs Director → Screenwriter → Visual Producer → Critic. Preview output stays in this page.</p><label htmlFor="creative-choice">Story direction</label><textarea id="creative-choice" value={choice} maxLength={500} onChange={event => setChoice(event.target.value)}/><Button disabled={!access || pending || !choice.trim() || (paid && !consent)} onClick={() => run('generate')}>Run four-stage preview</Button></section>
    <section className="panel provider-form"><h2>PersonaAI conversation</h2><label htmlFor="character-select">Character</label><select id="character-select" value={characterId} onChange={event => setCharacter(event.target.value)}>{characters.map(character => <option key={character.id} value={character.id}>{character.name}</option>)}</select><label htmlFor="character-message">Message</label><textarea id="character-message" value={message} maxLength={500} onChange={event => setMessage(event.target.value)}/><Button disabled={!access || pending || !message.trim() || (paid && !consent)} onClick={() => run('reply')}>Ask this character</Button></section></div>
    {output !== null && <><ProviderPreview data={output}/><details className="panel"><summary>Structured response</summary><pre className="provider-output">{JSON.stringify(output, null, 2)}</pre></details></>}
    <details className="panel"><summary>Recent provider usage</summary><p>Token counts are reported when available. Cost estimates require configured rates and may differ from billing.</p><pre className="provider-output">{JSON.stringify(usage, null, 2)}</pre></details>
  </div>;
}
