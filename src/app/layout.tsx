import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'AIRL — Artificial In Real Life', description: 'The real world is the prompt. Explore shared creative experiences, stories, and fictional characters.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: `(function(){var t='system';try{t=localStorage.getItem('airl-theme')||'system'}catch(e){}document.documentElement.dataset.theme=t==='light'||t==='dark'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'})()` }}/></head><body><a className="skip-link" href="#main">Skip to content</a>{children}</body></html>; }
