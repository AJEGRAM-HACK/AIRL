'use client';
import { useEffect, useState } from 'react';
export function RoomJoin({roomId="barangay-2099"}:{roomId?:string}) {
  const [url, setUrl] = useState('');
  const [localOnly, setLocalOnly] = useState(false);
  useEffect(() => {
    setUrl(`${window.location.origin}/live/${roomId}`);
    setLocalOnly(['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname));
  }, [roomId]);
  return <section className="vote-panel room-join" aria-label="Audience room joining">
    <h2>Join on your phone</h2>
    <p>Scan with your camera on the same Wi-Fi, then join the room to vote.</p>
    {localOnly ? <p role="status">Open Studio using the HTTPS LAN demo address to display a phone-accessible QR code.</p> : url && <>
      {/* The local endpoint encodes only this room's public URL. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/api/live/rooms/${roomId}/join-qr`} width={256} height={256} alt="QR code to join this audience room"/>
      <p><a href={url}>{url}</a></p>
      <p className="fine-print">Trust the demo certificate on your phone before scanning.</p>
    </>}
  </section>;
}
