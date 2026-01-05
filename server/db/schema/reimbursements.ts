import { date, integer, numeric, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { statusEnum } from "./general";
import { createSelectSchema, createInsertSchema, createUpdateSchema } from "drizzle-zod";

export const reimbursementTypeEnum = pgEnum("reimburse_types", [
    'Reimburse Kesehatan',
    'Reimburse Perjalanan Dinas',
    'Reimburse Operasional Kerja',
    'Lainnya'
])

export const reimbursements = pgTable("reimbursements", {
    id: integer().generatedByDefaultAsIdentity().primaryKey(),
    type: reimbursementTypeEnum().notNull(),
    description: text().notNull(),
    date: date().notNull(),
    amount: numeric({ precision: 19, scale: 4 }).notNull(),
    requester: integer().references(() => users.id, { onDelete: "cascade" }).notNull(),
    status: statusEnum().default("pending").notNull(),
    approver: integer().references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull(),
});

export const reimbursementsSchema = {
    update: createUpdateSchema(reimbursements),
    select: createSelectSchema(reimbursements),
    insert: createInsertSchema(reimbursements).omit({ id:true })
};
