import type { Metadata } from 'next';
import { PublicShell } from "@/components/layout/public-shell";
import { AccountPanel } from "@/components/platform/account";
export const metadata: Metadata = { title: 'Your account — AIRL' };

export default function Page() {
  return (
    <PublicShell>
      <AccountPanel />
    </PublicShell>
  );
}
