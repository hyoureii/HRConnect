import { Elysia } from "elysia";
import openapi from "@elysiajs/openapi";
import cors from "@elysiajs/cors";
import z from "zod";
import { leaveRoutes } from "./api/leave";
import { tripRoutes } from "./api/trips";
import { reimbursementRoutes } from "./api/reimbursements";
import { authPaths } from "./auth/authMacro";
import { db } from "./db/db";
import { users } from "./db/schema/auth";
import { leaveRequests } from "./db/schema/leaveReqs";
import { trips } from "./db/schema/trips";
import { reimbursements } from "./db/schema/reimbursements";
import { count, eq } from "drizzle-orm";
import { statusEnum } from "./db/schema/general";

const app = new Elysia({ prefix: "/api" })
    .use(cors({
        origin: [ "http://localhost:5173" ],
        credentials: true,
    }))
    .use(authPaths)
    .use(leaveRoutes)
    .use(tripRoutes)
    .use(reimbursementRoutes)
    .get("/stats", async () => {
        const [totalUsersResult, pendingLeavesResult, pendingTripsResult, pendingReimbursementsResult] = await Promise.all([
            db.select({ count: count() }).from(users),
            db.select({ count: count() }).from(leaveRequests).where(eq(leaveRequests.status, statusEnum.enumValues[0])),
            db.select({ count: count() }).from(trips).where(eq(trips.status, statusEnum.enumValues[0])),
            db.select({ count: count() }).from(reimbursements).where(eq(reimbursements.status, statusEnum.enumValues[0])),
        ]);

        return {
            totalUsers: totalUsersResult[0].count,
            pendingLeaves: pendingLeavesResult[0].count,
            pendingTrips: pendingTripsResult[0].count,
            pendingReimbursements: pendingReimbursementsResult[0].count,
        };
    }, { auth: true })
    .use(openapi({
        mapJsonSchema: { zod: z.toJSONSchema },
    }))

export type App = typeof app;

app.listen(3000);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
