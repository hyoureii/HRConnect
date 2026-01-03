import { defineConfig } from "drizzle-kit";
import env from "./lib/env";

export default defineConfig({
  dialect: "postgresql",
  out: "server/db/migrations",
  schema: "server/db/schema",
  dbCredentials: {
    url: env.DB_URL
  },
});
