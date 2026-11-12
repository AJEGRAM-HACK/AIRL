import type { Metadata } from 'next';
import './globals.css';
import { AccessProvider } from '@/components/platform/access';
import { pageAccess } from '@/server/platform/page';
export const metadata: Metadata = { title: 'AIRL — Artificial In Real Life', description: 'The real world is the prompt. Explore shared creative experiences, stories, and fictional characters.' };
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { const access=await pageAccess(); return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: `(function(){var t='dark';try{t=localStorage.getItem('airl-theme')||'dark'}catch(e){}document.documentElement.dataset.theme=t==='light'||t==='dark'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'})()` }}/></head><body><AccessProvider access={access}><a className="skip-link" href="#main">Skip to content</a>{children}</AccessProvider></body></html>; }
