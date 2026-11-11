import { loadEnvConfig } from "@next/env";
import { PlatformStore } from "../src/server/platform/store";
loadEnvConfig(process.cwd());
const email = process.argv[2];
if (!email)
  throw new Error(
    "Usage: npm run account:admin -- existing-account@example.com",
  );
const store = new PlatformStore();
try {
  store.bootstrapAdmin(email);
  console.log(
    "Existing account granted admin access. Sign in to administer creator permissions.",
  );
} finally {
  store.close();
}
