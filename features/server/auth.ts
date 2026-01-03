import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../server/db/db";
import * as authSchema from "../server/db/schema/auth";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        usePlural: true,
        schema: {
            ...authSchema,
        }
    }),
    emailAndPassword: {
        enabled: true
    },
    advanced: {
        database: {
            generateId: "serial"
        }
    },
    trustedOrigins: [ "http://localhost:5173" ]
});
