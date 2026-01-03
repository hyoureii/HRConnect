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

    .get("/trips", async ({ request: { headers }, query }) => {
        const session = await auth.api.getSession({ headers });
        if (!session) return { error: "Unauthorized" };

        const currentUserId = parseInt(session.user.id);
        const userRole = await db.select({ roleId: userRoles.roleId })
            .from(userRoles)
            .where(eq(userRoles.userId, currentUserId))
            .limit(1);

        const roleId = userRole[0]?.roleId;
        const userIdFilter = query?.userId ? parseInt(query.userId as string) : null;

        // Check if can view all requests (admin)
        const canViewAll = await hasPermission(currentUserId, "view_all_requests");

        // Build base query with joins
        let requests = db.select({
            ...trips,
            requesterName: users.name,
            requesterRoleId: userRoles.roleId,
        })
        .from(trips)
        .innerJoin(users, eq(trips.requester, users.id))
        .innerJoin(userRoles, eq(users.id, userRoles.userId));

        // Apply filtering
        if (userIdFilter) {
            requests = requests.where(eq(trips.requester, userIdFilter));
        } else if (!canViewAll && roleId !== 1) {
            if (roleId === 5) { // Employee - own requests only
                requests = requests.where(eq(trips.requester, currentUserId));
            } else {
                // Get pending requests they can approve
                requests = requests.where(eq(trips.status, "pending"));

                // Filter based on permissions
                const conditions = [];

                if (await hasPermission(currentUserId, "approve_trip_employee")) {
                    conditions.push(eq(userRoles.roleId, 5)); // Employees
                }
                if (await hasPermission(currentUserId, "approve_trip_supervisor")) {
                    conditions.push(eq(userRoles.roleId, 2)); // Supervisors
                }
                if (await hasPermission(currentUserId, "approve_trip_finance")) {
                    conditions.push(eq(userRoles.roleId, 3)); // Finance
                }
                if (await hasPermission(currentUserId, "approve_trip_hrd")) {
                    conditions.push(eq(userRoles.roleId, 4)); // HRD
                }

                if (conditions.length > 0) {
                    requests = requests.where(or(...conditions));
                } else {
                    return []; // No permission to approve any trips
                }
            }
        }

        return await requests;
    })
    .get("/trips/:id", async ({ params: { id }, set }) => {
        const result = await db.select().from(trips).where(eq(trips.id, parseInt(id)));
        if (result.length === 0) {
            set.status = 404;
            return { error: "Trip not found" };
        }
        return result[0];
    })
    .post("/trips", async ({ body, request: { headers } }) => {
        const session = await auth.api.getSession({ headers });
        if (!session) return { error: "Unauthorized" };

        const data = tripSchema.insert.parse(body);
        const result = await db.insert(trips).values({
            ...data,
            requester: parseInt(session.user.id),
            createdAt: new Date(),
        }).returning();
        return result[0];
    }, {
        body: tripSchema.insert
    })
    .put("/trips/:id", async ({ params: { id }, body, request: { headers }, set }) => {
        const session = await auth.api.getSession({ headers });
        if (!session) {
            set.status = 401;
            return { error: "Unauthorized" };
        }

        const requestId = parseInt(id);
        const currentUserId = parseInt(session.user.id);

        // Get request with requester role
        const requestWithRole = await db.select({
            ...trips,
            requesterRoleId: userRoles.roleId,
        })
        .from(trips)
        .innerJoin(users, eq(trips.requester, users.id))
        .innerJoin(userRoles, eq(users.id, userRoles.userId))
        .where(eq(trips.id, requestId))
        .limit(1);

        if (requestWithRole.length === 0) {
            set.status = 404;
            return { error: "Trip request not found" };
        }

        const request = requestWithRole[0];
        const requesterRoleId = request.requesterRoleId;

        // Build permission to check based on requester role
        const permissionMap: Record<number, string> = {
            5: "approve_trip_employee",    // Employee
            2: "approve_trip_supervisor",  // Supervisor
            3: "approve_trip_finance",     // Finance
            4: "approve_trip_hrd",        // HRD
        };

        const requiredPermission = permissionMap[requesterRoleId];

        // Check permission
        const canApprove = await hasPermission(currentUserId, requiredPermission!);

        if (!canApprove) {
            set.status = 403;
            return { error: "Unauthorized" };
        }

        // Prevent self-approval
        if (currentUserId === request.requester) {
            set.status = 403;
            return { error: "Unauthorized" };
        }

        const data = tripSchema.update.parse(body);
        const result = await db.update(trips)
            .set({
                ...data,
                approver: currentUserId,
            })
            .where(eq(trips.id, requestId))
            .returning();

        return result[0];
    }, {
        body: tripSchema.update
    })
    .delete("/trips/:id", async ({ params: { id }, set }) => {
        const result = await db.delete(trips).where(eq(trips.id, parseInt(id))).returning();
        if (result.length === 0) {
            set.status = 404;
            return { error: "Trip not found" };
        }
        return result[0];
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
