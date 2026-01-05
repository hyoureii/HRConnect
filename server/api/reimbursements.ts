import Elysia from "elysia";
import { reimbursementsSchema, reimbursements } from "../db/schema/reimbursements";
import { db } from "../db/db";
import { eq } from "drizzle-orm";
import { users } from "../db/schema/auth";
import z from "zod";
import { authPaths } from "../auth/authMacro";
import { checkPermissions } from "../utils";

export const reimbursementRoutes = new Elysia({ prefix: "/reimburse"}).use(authPaths)
    .get("/", async ({ set }) => {
        const hasPermission = await checkPermissions({ reimbursement: ["approve"] });
        if (!hasPermission.success) throw set.status = 403;

        const rows = db.select().from(reimbursements)
            .leftJoin(users, eq(reimbursements.requester, users.id));
        console.log(rows);
        return reimbursementsSchema.select.parse(rows);
    }, { auth: true })

    .get("/:id", async ({ params: { id }, set }) => {
        const hasPermission = await checkPermissions({ reimbursement: ["approve"] });
        if (!hasPermission.success) throw set.status = 403;

        const result = await db.select().from(reimbursements)
            .leftJoin(users, eq(users.id, reimbursements.requester))
            .where(eq(reimbursements.id, id))
            .limit(1);
        if (result.length === 0) throw set.status = 404;

        return reimbursementsSchema.select.parse(result[0].reimbursements);
    }, {
        auth: true,
        params: z.object({ id: z.coerce.number() })
    })

    .post("/", async ({ body, set }) => {
        const hasPermission = await checkPermissions({ reimbursement: ["create"] });
        if (!hasPermission.success) throw set.status = 403;

        const result = await db.insert(reimbursements).values(body).returning();
        return result[0];
    }, {
        auth: true,
        body: reimbursementsSchema.insert
    })

    .put("/approve/:id", async ({ params: { id }, body, set, user }) => {
        const hasPermission = await checkPermissions({ reimbursement: ["approve"] });
        if (!hasPermission.success) throw set.status = 403;

        const currentUserId = parseInt(user.id);

        const request = await db.select().from(reimbursements).where(eq(reimbursements.id, id)).limit(1);
        if (request.length === 0) throw set.status = 404;

        if (currentUserId === request[0].requester) throw set.status = 403;

        const result = await db.update(reimbursements)
            .set({
                status: body.status,
                approver: currentUserId,
            })
            .where(eq(reimbursements.id, id))
            .returning();

        return result[0];
    }, {
        auth: true,
        body: reimbursementsSchema.update.pick({ status: true }),
        params: z.object({ id: z.coerce.number() })
    })

    .delete("/:id", async ({ params: { id }, set, user }) => {
        const currentUserId = parseInt(user.id);

        const request = await db.select().from(reimbursements).where(eq(reimbursements.id, id)).limit(1);
        if (request.length === 0) throw set.status = 404;

        if (request[0].requester !== currentUserId) throw set.status = 403;

        const result = await db.delete(reimbursements).where(eq(reimbursements.id, id)).returning();
        return result[0];
    }, {
        auth: true,
        params: z.object({ id: z.coerce.number() })
    })
