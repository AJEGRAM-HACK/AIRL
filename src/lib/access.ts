import type { AccountRole } from "./domain";

export type PageAccess = {
  account: { id: string; role: AccountRole } | null;
  canCreate: boolean;
  managedWorldIds: string[];
  legacyOperator: boolean;
};
export const anonymousAccess: PageAccess = {
  account: null,
  canCreate: false,
  managedWorldIds: [],
  legacyOperator: false,
};
