import { Elysia } from "elysia";
import { auth } from "./auth";
import openapi from "@elysiajs/openapi";
import { db } from "./db/db";
import { leaveRequests, leaveReqSchema } from "./db/schema/leaveReqs";
import { reimbursements, reimbursementsSchema } from "./db/schema/reimbursements";
import { trips, tripSchema } from "./db/schema/trips";
import { userRoles, roles, permissions, rolePermissions } from "./db/schema/general";
import { users } from "./db/schema/auth";
import { eq, and, or, sql } from "drizzle-orm";
import z from "zod";
import cors from "@elysiajs/cors";

const authPaths = new Elysia({ name: 'better-auth' })
    .mount(auth.handler)
    .macro({
        auth: {
            async resolve({ status, request: { headers } }) {
                const session = await auth.api.getSession({
                    headers
                })

                if (!session) return status(401)

                return {
                    user: session.user,
                    session: session.session
                }
            }
        }
    })

async function hasPermission(userId: number, permissionName: string): Promise<boolean> {
  const result = await db.select({ hasPermission: sql<number>`COUNT(*)::int > 0` })
    .from(userRoles)
    .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(
      and(
        eq(userRoles.userId, userId),
        eq(permissions.name, permissionName)
      )
    )
    .limit(1);

  return result[0]?.hasPermission || false;
}

const app = new Elysia({ prefix: "/api" })
    .use(cors({
        origin: [ "http://localhost:5173" ],
        credentials: true,
    }))
    .use(openapi({
        mapJsonSchema: { zod: z.toJSONSchema, },
    }))
    .use(authPaths)

    .get("/dashboard/stats", async ({ request: { headers } }) => {
        const session = await auth.api.getSession({ headers });
        if (!session) return { error: "Unauthorized" };

        const totalUsers = await db.select().from(users);
        const pendingLeaves = await db.select().from(leaveRequests)
            .where(eq(leaveRequests.status, "pending"));
        const pendingTrips = await db.select().from(trips)
            .where(eq(trips.status, "pending"));
        const pendingReimbursements = await db.select().from(reimbursements)
            .where(eq(reimbursements.status, "pending"));

        return {
            totalUsers: totalUsers.length,
            pendingLeaves: pendingLeaves.length,
            pendingTrips: pendingTrips.length,
            pendingReimbursements: pendingReimbursements.length,
        };
    })

    .get("/users/me/role", async ({ request: { headers } }) => {
        const session = await auth.api.getSession({ headers });
        if (!session) {
            return { roleId: null, roleName: null };
        }

        const userId = session.user.id;
        const userRole = await db
            .select({
                roleId: userRoles.roleId,
                roleName: roles.name
            })
            .from(userRoles)
            .innerJoin(roles, eq(userRoles.roleId, roles.id))
            .where(eq(userRoles.userId, parseInt(userId)))
            .limit(1);

        if (userRole.length === 0) {
            return { roleId: null, roleName: null };
        }

        return userRole[0];
    }, {
        auth: true
    })

export type App = typeof app

app.listen(3000);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
