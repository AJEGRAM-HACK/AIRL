import type { RoomProvider } from './production-selection';
'use client';
import { useAccess } from '@/components/platform/access';
import { RoomProduction } from '@/features/production/room-production';
import { useEffect, useRef, useState } from 'react';
import { Check, Radio, Vote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoomSnapshot, type RoomState, type SessionState } from './types';
import { ProviderPicker } from '@/components/platform/provider-picker';
export function CommunityPanel({ operatorView = false,roomId='barangay-2099' }: { operatorView?: boolean;roomId?:string }) {
  const access=useAccess();
  const base=`/api/live/rooms/${roomId}`;
  const sessionRevision = useRef(0);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [session, setSession] = useState<SessionState>({ joined: false, operator: false, vote: null });
  const [selection, setSelection] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState<RoomProvider>({ mode: 'ollama',model:'qwen3:4b-instruct',consent: false });
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    let active = true;
    async function refresh() {
      const revision = sessionRevision.current;
      try {
        const response = await fetch(`${base}/state`, { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (active) { setRoom(RoomSnapshot.parse(data.room)); if (revision === sessionRevision.current) setSession(data.session); setError(''); }
      } catch (error) { if (active) setError(error instanceof Error ? error.message : 'Unable to load room.'); }
    }
    void refresh();
    const source = new EventSource(`${base}/events`);
    source.onopen = () => { setConnected(true); void refresh(); };
    source.onmessage = event => {
      try { const state = RoomSnapshot.parse(JSON.parse(event.data)); setRoom(state); } catch { setError('Invalid room update. Reconnect to retry.'); }
    };
    source.addEventListener('production', () => window.dispatchEvent(new CustomEvent(`airl-production:${roomId}`)));
    source.onerror = () => setConnected(false);
    window.addEventListener('focus', refresh);
    return () => { active = false; source.close(); window.removeEventListener('focus', refresh); };
  }, [base,roomId]);
  useEffect(() => { setSelection(''); }, [room?.roundId]);
  // Own vote is private and re-fetched whenever the active round changes.
  useEffect(() => {
    if (!room) return;
    let active = true;
    const revision = sessionRevision.current;
    fetch(roomId==='barangay-2099'?'/api/live/session':`/api/live/session?universe=${roomId}`, { cache: 'no-store' }).then(response => response.json()).then(value => { if (active && revision === sessionRevision.current && !value.error) setSession(value); }).catch(() => {});
    return () => { active = false; };
  }, [room?.roundId]);
  async function action(url: string, input: unknown) {
    sessionRevision.current++;
    setPending(true); setError('');
    try {
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(url==='/api/live/session'?{...(input as object),universe:roomId}:input) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to complete this action.');
      if (data.room) setRoom(RoomSnapshot.parse(data.room));
      sessionRevision.current++;
      setSession(data.session || data);
    } catch (error) { setError(error instanceof Error ? error.message : 'Please retry.'); } finally { setPending(false);if(url.endsWith('/close'))setProvider(value=>({...value,consent:false})); }
  }
  const showOperator=operatorView&&session.operator&&(access.managedWorldIds.includes(roomId)||(roomId==='barangay-2099'&&access.legacyOperator));
  const winner = room?.options.find(option => option.id === room.winner);
  return <section id="community-vote" className="vote-panel community-panel" aria-label={operatorView ? 'Room voting controls' : 'Community vote'}>
    <div className="eyebrow mint"><Radio size={15}/>{connected ? 'CONNECTED TO ROOM' : 'CONNECTING · RETRYING AUTOMATICALLY'}</div>
    <h2>{operatorView ? 'Community control' : 'What happens next?'}</h2>
    <p>Real local votes · Operator-selected production</p>
    {error && <div className="form-error" role="alert">{error}</div>}
    {!room ? <p role="status">Loading room…</p> : <>
      <div className="community-stats"><span><b>{room.participantCount}</b> joined sessions</span><span><b>{room.totalVotes}</b> votes this round</span></div>
      <div className="vote-status"><span className="live-dot"/>{room.status === 'open' ? 'Voting open' : 'Voting closed'}<span>{room.options.length} choices</span></div>
      {!session.joined ? <Button disabled={pending} onClick={() => action('/api/live/session', {})}>Join room to vote <Vote size={16}/></Button> : !session.vote && room.status === 'open' && <p className="vote-instruction">Choose a direction below, then tap Cast my vote.</p>}
      <fieldset disabled={pending || !session.joined || !!session.vote || room.status !== 'open'}><legend className="sr-only">Choose the next story direction</legend>{room.options.map(option => {
        const percentage = room.totalVotes ? Math.round(option.votes / room.totalVotes * 100) : 0;
        return <label className={`choice ${option.id === (session.vote || selection) ? 'chosen' : ''}`} key={option.id}>
          <input type="radio" name={operatorView ? 'studio-choice' : 'live-choice'} checked={option.id === (session.vote || selection)} onChange={() => setSelection(option.id)}/>
          <span><b>{option.title}</b><small>{option.description}</small><span className="result-bar"><i style={{ width: `${percentage}%` }}/></span><small>{option.votes} votes · {percentage}%</small></span>
        </label>;
      })}</fieldset>
      {session.joined && <Button disabled={pending || !!session.vote || !selection || room.status !== 'open'} onClick={() => action(`${base}/vote`, { roundId: room.roundId, optionId: selection })}>{session.vote ? <><Check size={16}/> Vote recorded</> : pending ? 'Saving…' : 'Cast my vote'}</Button>}
      {winner && <div className="winner-callout" role="status"><b>Winning direction</b><p>{winner.title}</p><small>Ties use the displayed option order. Production is queued from this finalized direction. An operator reviews the result before publication.</small></div>}
      <p className="fine-print">One vote per anonymous session per round. Clearing cookies creates a new identity. Counts update across sessions through the local server.</p>
      {showOperator && <div className="operator-controls"><h3>Operator controls</h3><ProviderPicker background value={provider} onChange={value=>setProvider({mode:value.mode as RoomProvider["mode"],model:value.model,consent:value.consent})}/><Button variant="outline" disabled={pending || room.status !== 'open' || (provider.mode === 'hosted_openai' && !provider.consent)} onClick={() => action(`${base}/close`, { roundId: room.roundId, provider })}>Close voting & produce</Button><Button variant="outline" disabled={pending || room.status !== 'closed'} onClick={() => action(`${base}/next`, { roundId: room.roundId })}>Start next round</Button></div>}
    </>}
    {showOperator && <RoomProduction operator={session.operator} roomId={roomId}/>}
  </section>;
}
