import { date, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { statusEnum } from "./general";
import { createSelectSchema, createInsertSchema, createUpdateSchema } from "drizzle-zod";

export const tripTypeEnum = pgEnum("trip_types", [
    'Perjalanan Dinas Operasional',
    'Perjalanan Bisnis Klien',
    'Perjalanan Proyek',
    'Perjalanan Pelatihan',
    'Lainnya'
]);

export const trips = pgTable("trips", {
    id: integer().generatedByDefaultAsIdentity().primaryKey(),
    type: tripTypeEnum().notNull(),
    description: text().notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    requester: integer().references(() => users.id, { onDelete: "cascade" }).notNull(),
    status: statusEnum().default("pending").notNull(),
    approver: integer().references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull(),
});

export const tripSchema = {
    select: createSelectSchema(trips),
    insert: createInsertSchema(trips),
    update: createUpdateSchema(trips).omit({ id:true }),
};
