import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

export const statusEnum = pgEnum("leave_req_status", ["pending", "approved", "refused"]);

export const roles = pgTable("roles", (t) => ({
    id: t.integer().generatedByDefaultAsIdentity().primaryKey(),
    name: t.text().notNull().unique(),
}));

export const userRoles = pgTable("user_roles", (t) => ({
    id: t.integer().generatedByDefaultAsIdentity().primaryKey(),
    userId: t.integer("user_id").references(() => users.id, {onDelete: "cascade"}).notNull(),
    roleId: t.integer("role_id").references(() => roles.id, {onDelete: "cascade"}).notNull(),
}));

export const permissions = pgTable("permissions", (t) => ({
    id: t.integer().generatedByDefaultAsIdentity().primaryKey(),
    name: t.text().notNull().unique(),
}));

export const rolePermissions = pgTable("role_permissions", (t) => ({
    id: t.integer().generatedByDefaultAsIdentity().primaryKey(),
    roleId: t.integer("role_id").references(() => roles.id, {onDelete: "cascade"}).notNull(),
    permissionId: t.integer("permission_id").references(() => permissions.id, {onDelete: "cascade"}).notNull(),
}));

export const userRoleSchema = {
    update: createUpdateSchema(userRoles),
    select: createSelectSchema(userRoles),
    insert: createInsertSchema(userRoles).omit({ id:true })
};
