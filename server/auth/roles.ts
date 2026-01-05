import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";
import * as z from "zod";

const statement = {
    ...defaultStatements,
    leave: ["approve", "approveEmployee", "create"],
    trip: ["approve", "approveEmployee", "create"],
    reimbursement: ["approve", "create"],
} as const;

export const ac = createAccessControl(statement);

export const roles = {
    admin: ac.newRole({
        leave: ["approve", "approveEmployee", "create"],
        trip: ["approve", "approveEmployee", "create"],
        reimbursement: ["approve", "create"],
        ...adminAc.statements,
    }),
    supervisor: ac.newRole({
        leave: ["approve", "create"],
        trip: ["approve", "create"]
    }),
    hrd: ac.newRole({
        leave: ["approve", "create"],
        trip: ["approve", "create"]
    }),
    finance: ac.newRole({
        reimbursement: ["approve", "create"]
    }),
    employee: ac.newRole({
        reimbursement: ["create"]
    }),
}

export const roleTypes = z.enum(["admin", "supervisor", "hrd", "finance", "employee"]);
export type Roles = z.infer<typeof roleTypes>
