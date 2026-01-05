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

    .get("/leave-requests", async ({ request: { headers }, query }) => {
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
            ...leaveRequests,
            requesterName: users.name,
            requesterRoleId: userRoles.roleId,
        })
        .from(leaveRequests)
        .innerJoin(users, eq(leaveRequests.requester, users.id))
        .innerJoin(userRoles, eq(users.id, userRoles.userId));

        // Apply filtering
        if (userIdFilter) {
            requests = requests.where(eq(leaveRequests.requester, userIdFilter));
        } else if (!canViewAll && roleId !== 1) {
            if (roleId === 5) { // Employee - own requests only
                requests = requests.where(eq(leaveRequests.requester, currentUserId));
            } else {
                // Get pending requests they can approve
                requests = requests.where(eq(leaveRequests.status, "pending"));

                // Filter based on permissions
                const conditions = [];

                if (await hasPermission(currentUserId, "approve_leave_employee")) {
                    conditions.push(eq(userRoles.roleId, 5)); // Employees
                }
                if (await hasPermission(currentUserId, "approve_leave_supervisor")) {
                    conditions.push(eq(userRoles.roleId, 2)); // Supervisors
                }
                if (await hasPermission(currentUserId, "approve_leave_finance")) {
                    conditions.push(eq(userRoles.roleId, 3)); // Finance
                }
                if (await hasPermission(currentUserId, "approve_leave_hrd")) {
                    conditions.push(eq(userRoles.roleId, 4)); // HRD
                }

                if (conditions.length > 0) {
                    requests = requests.where(or(...conditions));
                } else {
                    return []; // No permission to approve any leaves
                }
            }
        }

        return await requests;
    })
    .get("/leave-requests/:id", async ({ params: { id }, set }) => {
        const result = await db.select().from(leaveRequests).where(eq(leaveRequests.id, parseInt(id)));
        if (result.length === 0) {
            set.status = 404;
            return { error: "Leave request not found" };
        }
        return result[0];
    })
    .post("/leave-requests", async ({ body, request: { headers } }) => {
        const session = await auth.api.getSession({ headers });
        if (!session) return { error: "Unauthorized" };

        const data = leaveReqSchema.insert.parse(body);
        const result = await db.insert(leaveRequests).values({
            ...data,
            requester: parseInt(session.user.id),
            createdAt: new Date(),
        }).returning();
        return result[0];
    }, {
        body: leaveReqSchema.insert
    })
    .put("/leave-requests/:id", async ({ params: { id }, body, request: { headers }, set }) => {
        const session = await auth.api.getSession({ headers });
        if (!session) {
            set.status = 401;
            return { error: "Unauthorized" };
        }

        const requestId = parseInt(id);
        const currentUserId = parseInt(session.user.id);

        // Get request with requester role
        const requestWithRole = await db.select({
            ...leaveRequests,
            requesterRoleId: userRoles.roleId,
        })
        .from(leaveRequests)
        .innerJoin(users, eq(leaveRequests.requester, users.id))
        .innerJoin(userRoles, eq(users.id, userRoles.userId))
        .where(eq(leaveRequests.id, requestId))
        .limit(1);

        if (requestWithRole.length === 0) {
            set.status = 404;
            return { error: "Leave request not found" };
        }

        const request = requestWithRole[0];
        const requesterRoleId = request.requesterRoleId;

        // Build permission to check based on requester role
        const permissionMap: Record<number, string> = {
            5: "approve_leave_employee",    // Employee
            2: "approve_leave_supervisor",  // Supervisor
            3: "approve_leave_finance",     // Finance
            4: "approve_leave_hrd",        // HRD
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

        const data = leaveReqSchema.update.parse(body);
        const result = await db.update(leaveRequests)
            .set({
                ...data,
                approver: currentUserId,
            })
            .where(eq(leaveRequests.id, requestId))
            .returning();

        return result[0];
    }, {
        body: leaveReqSchema.update
    })
    .delete("/leave-requests/:id", async ({ params: { id }, set }) => {
        const result = await db.delete(leaveRequests).where(eq(leaveRequests.id, parseInt(id))).returning();
        if (result.length === 0) {
            set.status = 404;
            return { error: "Leave request not found" };
        }
        return result[0];
    })

export type App = typeof app

app.listen(3000);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
