import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'CinemAI — Stories made by AI. Directed by everyone.', description: 'Watch, choose, and shape the next chapter of Barangay 2099.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a>{children}</body></html>; }
