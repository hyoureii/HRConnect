import { date, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { statusEnum } from "./general";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export const leaveTypeEnum = z.enum([
    'Cuti Tahunan',
    'Cuti Sakit',
    'Cuti Melahirkan',
    'Cuti Keguguran',
    'Cuti Penting',
    'Cuti Bersama',
    'Cuti Ibadah',
    'Cuti Kompensasi',
    'Lainnya'
])

export const leaveRequests = pgTable("leave_requests", {
    id: integer().generatedByDefaultAsIdentity().primaryKey(),
    leaveType: text("leave_type").notNull(),
    description: text().notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    requester: integer().references(() => users.id, { onDelete: "cascade" }).notNull(),
    status: statusEnum().default("pending").notNull(),
    approver: integer().references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull(),
});

export const leaveReqSchema = {
    update: createUpdateSchema(leaveRequests),
    select: createSelectSchema(leaveRequests),
    insert: createInsertSchema(leaveRequests).omit({ id:true })
};
