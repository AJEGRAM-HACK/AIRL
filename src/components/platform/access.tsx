"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { anonymousAccess, type PageAccess } from "@/lib/access";

const AccessContext = createContext<PageAccess & { clearAccess: () => void }>({
  ...anonymousAccess,
  clearAccess: () => {},
});
export function AccessProvider({
  access,
  children,
}: {
  access: PageAccess;
  children: React.ReactNode;
}) {
  const [current, setCurrent] = useState(access);
  useEffect(() => setCurrent(access), [access]);
  return (
    <AccessContext.Provider
      value={{ ...current, clearAccess: () => setCurrent(anonymousAccess) }}
    >
      {children}
    </AccessContext.Provider>
  );
}
export const useAccess = () => useContext(AccessContext);
export function AccountNavigation({ active = false }: { active?: boolean }) {
  const { account } = useAccess();
  return <Link href="/account" aria-current={active ? 'page' : undefined}>
    {account ? 'Profile' : 'Sign in'}
  </Link>;
}
export function CanCreate({ children }: { children: React.ReactNode }) {
  return useAccess().canCreate ? children : null;
}
export function CanManage({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return useAccess().managedWorldIds.includes(id) ? children : null;
}
export function StudioNavigation({
  universeId,
  active = false,
}: {
  universeId?: string;
  active?: boolean;
}) {
  const access = useAccess();
  if (!access.canCreate && !access.legacyOperator) return null;
  const href =
    universeId && access.managedWorldIds.includes(universeId)
      ? `/studio/worlds/${universeId}`
      : !access.canCreate && access.legacyOperator
        ? "/studio/barangay-2099"
        : "/studio";
  return (
    <Link href={href} aria-current={active ? "page" : undefined}>
      Studio
    </Link>
  );
}
