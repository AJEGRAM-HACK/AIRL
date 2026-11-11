import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'AIRL — Artificial In Real Life', description: 'The real world is the prompt. Explore shared creative experiences, stories, and fictional characters.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a>{children}</body></html>; }
