import Elysia from "elysia";
import { tripSchema, trips } from "../db/schema/trips";
import { db } from "../db/db";
import { eq, ne } from "drizzle-orm";
import { users } from "../db/schema/auth";
import z from "zod";
import { authPaths } from "../auth/authMacro";
import { checkPermissions } from "../utils";
import { roleTypes } from "../auth/roles";

export const tripRoutes = new Elysia({ prefix: "/trips"}).use(authPaths)
    .get("/", async ({ set }) => {
        const hasPermission = await checkPermissions({ trip: ["approve"] });
        const hasEmployeePermission = await checkPermissions({ trip: ["approveEmployee"] });
        if (!hasPermission.success && !hasEmployeePermission.success) throw set.status = 403;

        let rows, employeeRows;
        const getRows = () => db.select().from(trips);
        if (hasPermission.success) {
            rows = getRows().leftJoin(users, ne(users.role, roleTypes.enum.employee));
        };
        if (hasEmployeePermission.success) {
            employeeRows = getRows().leftJoin(users, eq(users.role, roleTypes.enum.employee));
        };
        rows = { ...rows, ...employeeRows };
        console.log(rows);
        return tripSchema.select.parse(rows);
    }, { auth: true })

    .get("/:id", async ({ params: { id }, set }) => {
        const hasPermission = await checkPermissions({ trip: ["approve"] });
        const hasEmployeePermission = await checkPermissions({ trip: ["approveEmployee"] });
        if (!hasPermission.success && !hasEmployeePermission.success) throw set.status = 403;

        const result = await db.select().from(trips)
            .leftJoin(users, eq(users.id, trips.requester))
            .where(eq(trips.id, id))
            .limit(1);
        if (result.length === 0) throw set.status = 404;

        if (result[0].users!.role == roleTypes.enum.employee) {
            if (!hasEmployeePermission.success) throw set.status = 403;
        } else {
            if (!hasPermission.success) throw set.status = 403;
        }
        return tripSchema.select.parse(result[0].trips);
    }, {
        auth: true,
        params: z.object({ id: z.coerce.number() })
    })

    .post("/", async ({ body, set }) => {
        const hasPermission = await checkPermissions({ trip: ["create"] });
        if (!hasPermission.success) throw set.status = 403;

        const result = await db.insert(trips).values(body).returning();
        return result[0];
    }, {
        auth: true,
        body: tripSchema.insert
    })

    .put("/approve/:id", async ({ params: { id }, body, set, user }) => {
        const hasPermission = await checkPermissions({ trip: ["approve"] });
        const hasEmployeePermission = await checkPermissions({ trip: ["approveEmployee"] });
        if (!hasPermission.success && !hasEmployeePermission.success) throw set.status = 403;

        const currentUserId = parseInt(user.id);

        const request = await db.select().from(trips)
            .leftJoin(users, eq(users.id, trips.requester))
            .where(eq(trips.id, id))
            .limit(1);
        if (request.length === 0) throw set.status = 404;

        if (currentUserId === request[0].trips.requester) throw set.status = 403;
        if (request[0].users!.role === roleTypes.enum.employee) {
            if (!hasEmployeePermission.success) throw set.status = 403;
        } else {
            if (!hasPermission.success) throw set.status = 403;
        }

        const result = await db.update(trips)
            .set({
                status: body.status,
                approver: currentUserId,
            })
            .where(eq(trips.id, id))
            .returning();

        return result[0];
    }, {
        auth: true,
        body: tripSchema.update.pick({ status: true }),
        params: z.object({ id: z.coerce.number() })
    })

    .delete("/:id", async ({ params: { id }, set, user }) => {
        const currentUserId = parseInt(user.id);

        const requests = await db.select().from(trips).where(eq(trips.id, id)).limit(1);
        if (requests.length === 0) throw set.status = 404;

        const request = requests[0];

        if (request.requester !== currentUserId) throw set.status = 403;

        const result = await db.delete(trips).where(eq(trips.id, id)).returning();
        return result[0];
    }, {
        auth: true,
        params: z.object({ id: z.coerce.number() })
    })
