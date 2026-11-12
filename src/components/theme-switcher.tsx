'use client';
import { useEffect, useState } from 'react';
import { SunMoon } from 'lucide-react';
type Theme = 'system' | 'light' | 'dark';
export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('dark');
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      let saved = 'dark';
      try { saved = localStorage.getItem('airl-theme') || 'dark'; } catch {}
      const selected: Theme = saved === 'light' || saved === 'dark' ? saved : 'system';
      setTheme(selected);
      document.documentElement.dataset.theme = selected === 'system' ? (media.matches ? 'dark' : 'light') : selected;
    };
    apply();
    media.addEventListener('change', apply);
    window.addEventListener('storage', apply);
    return () => { media.removeEventListener('change', apply); window.removeEventListener('storage', apply); };
  }, []);
  function change(value: Theme) {
    setTheme(value);
    try { localStorage.setItem('airl-theme', value); } catch {}
    document.documentElement.dataset.theme = value === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : value;
  }
  return <label className="theme-switcher"><SunMoon size={16} aria-hidden="true"/><span className="sr-only">Color theme</span><select value={theme} onChange={event => change(event.target.value as Theme)} aria-label="Color theme"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>;
}
