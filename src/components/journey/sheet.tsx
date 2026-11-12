'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function JourneySheet({ open, title, onClose, children }: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const current = dialog.current;
    if (!open || !current) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    current.showModal();
    return () => {
      current.close();
      document.body.style.overflow = overflow;
    };
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className="journey-sheet"
      aria-labelledby="journey-sheet-title"
      onCancel={event => { event.preventDefault(); onClose(); }}
      onKeyDown={event => {
        if (event.key !== 'Tab') return;
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex]:not([tabindex="-1"])',
        )).filter(element => element.getClientRects().length > 0);
        const first = controls[0];
        const last = controls.at(-1);
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        }
      }}
      onClick={event => { if (event.target === dialog.current) onClose(); }}
    >
      <div className="journey-sheet-panel">
        <header>
          <h2 id="journey-sheet-title">{title}</h2>
          <button type="button" className="journey-icon-button" onClick={onClose} aria-label="Close sheet" autoFocus>
            <X size={22} aria-hidden="true" />
          </button>
        </header>
        <div className="journey-sheet-body">{open && children}</div>
      </div>
    </dialog>
  );
}
