import { db } from "../server/db/db";
import { users } from "../server/db/schema/auth";
import { roles, userRoles, permissions, rolePermissions } from "../server/db/schema/general";
import { leaveRequests } from "../server/db/schema/leaveReqs";
import { reimbursements } from "../server/db/schema/reimbursements";
import { trips } from "../server/db/schema/trips";
import { auth } from "../server/auth";

const rolesData = [
    { id: 1, name: "admin" },
    { id: 2, name: "supervisor" },
    { id: 3, name: "finance" },
    { id: 4, name: "hrd" },
    { id: 5, name: "employee" }
]

const permissionsData = [
    { id: 1, name: "approve_leave_employee" },
    { id: 2, name: "approve_trip_employee" },
    { id: 3, name: "approve_reimburse_employee" },
    { id: 4, name: "approve_leave_supervisor" },
    { id: 5, name: "approve_trip_supervisor" },
    { id: 6, name: "approve_leave_finance" },
    { id: 7, name: "approve_trip_finance" },
    { id: 8, name: "approve_leave_hrd" },
    { id: 9, name: "approve_trip_hrd" },
    { id: 10, name: "approve_reimburse_all" },
    { id: 11, name: "view_all_requests" }
]

const rolePermissionsData = [
    // Supervisor (roleId=2): Can approve all requests from employees only
    { roleId: 2, permissionId: 1 },  // approve_leave_employee
    { roleId: 2, permissionId: 2 },  // approve_trip_employee
    { roleId: 2, permissionId: 3 },  // approve_reimburse_employee

    // HRD (roleId=4): Can approve leave/trips from supervisor, finance, HRD
    { roleId: 4, permissionId: 4 },  // approve_leave_supervisor
    { roleId: 4, permissionId: 5 },  // approve_trip_supervisor
    { roleId: 4, permissionId: 6 },  // approve_leave_finance
    { roleId: 4, permissionId: 7 },  // approve_trip_finance
    { roleId: 4, permissionId: 8 },  // approve_leave_hrd
    { roleId: 4, permissionId: 9 },  // approve_trip_hrd

    // Finance (roleId=3): Can approve reimbursements from any role
    { roleId: 3, permissionId: 10 }, // approve_reimburse_all

    // Admin (roleId=1): All permissions
    { roleId: 1, permissionId: 1 },
    { roleId: 1, permissionId: 2 },
    { roleId: 1, permissionId: 3 },
    { roleId: 1, permissionId: 4 },
    { roleId: 1, permissionId: 5 },
    { roleId: 1, permissionId: 6 },
    { roleId: 1, permissionId: 7 },
    { roleId: 1, permissionId: 8 },
    { roleId: 1, permissionId: 9 },
    { roleId: 1, permissionId: 10 },
    { roleId: 1, permissionId: 11 }, // view_all_requests
]

const usersData = [
    {
        name: "fizryan",
        email: "fizryan@mail.com",
        password: "fizryan123",
        roleId: 1,
    },
    {
        name: "naufal",
        email: "naufal@mail.com",
        password: "naufal123",
        roleId: 2,
    },
    {
        name: "fathir",
        email: "fathir@mail.com",
        password: "fathir123",
        roleId: 3,
    },
    {
        name: "haidar",
        email: "haidar@mail.com",
        password: "haidar123",
        roleId: 4,
    },
    {
        name: "rusdi",
        email: "rusdi@mail.com",
        password: "rusdi123",
        roleId: 5,
    }
]

async function seed() {
  console.log("Clearing tables...");
  await db.delete(users)
  await db.delete(roles);
  await db.delete(userRoles);
  await db.delete(permissions);
  await db.delete(rolePermissions);
  await db.delete(leaveRequests);
  await db.delete(reimbursements);
  await db.delete(trips);

  console.log("Inserting sample data...");
  await db.insert(roles).values(rolesData);
  await db.insert(permissions).values(permissionsData);
  await db.insert(rolePermissions).values(rolePermissionsData);

  console.log("Signing up users and assigning roles...");
  for (const user of usersData) {
    console.log(`Creating user: ${user.name} (${user.email})`);
    
    const result = await auth.api.signUpEmail({
        body: {
            name: user.name,
            email: user.email,
            password: user.password,
        }
    });

    const userId = result.user.id;
    console.log(`User created with ID: ${userId}, assigning role: ${user.roleId}`);

    await db.insert(userRoles).values({
        userId: parseInt(userId),
        roleId: user.roleId
    });
  }

  console.log("Seeding completed successfully!");
}

if (import.meta.main) {
  seed().catch(console.error);
}
