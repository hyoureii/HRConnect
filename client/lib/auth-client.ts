import { createAuthClient } from "better-auth/vue";
import { adminClient } from "better-auth/client/plugins";
import { ac, roles } from "../../server/auth/roles";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
  plugins: [
    adminClient({
      ac: ac,
      roles: roles,
     }as Parameters<typeof adminClient>[0])
  ]
});

export type Session = typeof authClient.$Infer.Session;
