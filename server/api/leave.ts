import Elysia from "elysia";
import { leaveReqSchema, leaveRequests } from "../db/schema/leaveReqs";
import { db } from "../db/db";
import { eq, ne } from "drizzle-orm";
import { users } from "../db/schema/auth";
import { roleTypes } from "../auth/roles";
import z from "zod";
import { authPaths } from "../auth/authMacro";
import { checkPermissions } from "../utils";

export const leaveRoutes = new Elysia({ prefix: "/leave"}).use(authPaths)
    .get("/", async ({ set }) => {
        const hasPermission = await checkPermissions({ leave: ["approve"] });
        const hasEmployeePermission = await checkPermissions({ leave: ["approveEmployee"] });
        if (!hasPermission.success && !hasEmployeePermission.success) throw set.status = 403;

        let rows, employeeRows;
        const getRows = () => db.select().from(leaveRequests);
        if (hasPermission.success) {
            rows = getRows().leftJoin(users, ne(users.role, roleTypes.enum.employee));
        };
        if (hasEmployeePermission.success) {
            employeeRows = getRows().leftJoin(users, eq(users.role, roleTypes.enum.employee));        };
        rows = { ...rows, ...employeeRows };
        console.log(rows);
        return leaveReqSchema.select.parse(rows);
    }, { auth: true })

    .get("/:id", async ({ params: { id }, set }) => {
        const hasPermission = await checkPermissions({ leave: ["approve"] });
        const hasEmployeePermission = await checkPermissions({ leave: ["approveEmployee"] });
        if (!hasPermission.success && !hasEmployeePermission.success) throw set.status = 403;

        const result = await db.select().from(leaveRequests)
            .leftJoin(users, eq(users.id, leaveRequests.requester))
            .where(eq(leaveRequests.id, id))
            .limit(1);
        if (result.length === 0) throw set.status = 404;

        if (result[0].users!.role === roleTypes.enum.employee) {
            if (!hasEmployeePermission.success) throw set.status = 403;
        } else {
            if (!hasPermission.success) throw set.status = 403;
        }
        return leaveReqSchema.select.parse(result[0].leave_requests);
    }, {
        auth: true,
        params: z.object({ id: z.coerce.number() })
    })

    .post("/", async ({ body, set }) => {
        const hasPermission = await checkPermissions({ leave: ["create"] });
        if (!hasPermission.success) throw set.status = 403;

        const result = await db.insert(leaveRequests).values(body).returning();
        return result[0];
    }, {
        auth: true,
        body: leaveReqSchema.insert
    })

    .put("/approve/:id", async ({ params: { id }, body, set, user }) => {
        const hasPermission = await checkPermissions({ leave: ["approve"] });
        const hasEmployeePermission = await checkPermissions({ leave: ["approveEmployee"] });
        if (!hasPermission.success && !hasEmployeePermission.success) throw set.status = 403;

        const currentUserId = parseInt(user.id);

        const request = await db.select().from(leaveRequests)
            .leftJoin(users, eq(users.id, leaveRequests.requester))
            .where(eq(leaveRequests.id, id))
            .limit(1);
        if (request.length === 0) throw set.status = 404;

        if (currentUserId === request[0].leave_requests.requester) throw set.status = 403;
        if (request[0].users!.role === roleTypes.enum.employee) {
            if (!hasEmployeePermission.success) throw set.status = 403;
        } else {
            if (!hasPermission.success) throw set.status = 403;
        }

        const result = await db.update(leaveRequests)
            .set({
                status: body.status,
                approver: currentUserId,
            })
            .where(eq(leaveRequests.id, id))
            .returning();

        return result[0];
    }, {
        auth: true,
        body: leaveReqSchema.update.pick({ status: true }),
        params: z.object({ id: z.coerce.number() })
    })

    .delete("/:id", async ({ params: { id }, set, user }) => {
        const currentUserId = parseInt(user.id);

        const request = await db.select().from(leaveRequests).where(eq(leaveRequests.id, id)).limit(1);
        if (request.length === 0) throw set.status = 404;

        if (request[0].requester !== currentUserId) throw set.status = 403;

        const result = await db.delete(leaveRequests).where(eq(leaveRequests.id, id)).returning();
        return result[0];
    }, {
        auth: true,
        params: z.object({ id: z.coerce.number() })
    })
