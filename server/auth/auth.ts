import { betterAuth } from "better-auth";
import { admin as adminPlugin } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/db";
import * as schema from "../db/schema/auth";
import { ac, roles } from "./roles";


export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        usePlural: true,
        schema: {
            ...schema
        },
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: false
    },
    advanced: {
        database: {
            generateId: "serial"
        }
    },
    trustedOrigins: [ "http://localhost:5173" ],
    plugins: [
        adminPlugin({
            ac: ac,
            roles: roles,
            defaultRole: "employee"
        })
    ]
});
