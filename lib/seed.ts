import { auth } from "../server/auth/auth";
import { Roles } from "../server/auth/roles";
import { db } from "../server/db/db";
import { users } from "../server/db/schema/auth";
import { leaveRequests } from "../server/db/schema/leaveReqs";
import { reimbursements } from "../server/db/schema/reimbursements";
import { trips } from "../server/db/schema/trips";

const usersData: Array<{
    name: string
    email: string
    password: string
    role?: Roles
}> = [
    {
        name: "fizryan",
        email: "fizryan@mail.com",
        password: "fizryan123",
        role: "admin",
    },
    {
        name: "naufal",
        email: "naufal@mail.com",
        password: "naufal123",
        role: "supervisor",
    },
    {
        name: "fathir",
        email: "fathir@mail.com",
        password: "fathir123",
        role: "finance",
    },
    {
        name: "haidar",
        email: "haidar@mail.com",
        password: "haidar123",
        role: "hrd",
    },
    {
        name: "rusdi",
        email: "rusdi@mail.com",
        password: "rusdi123",
    }
]

async function seed() {
  console.log("Clearing tables...");
  await db.delete(users)
  await db.delete(leaveRequests);
  await db.delete(reimbursements);
  await db.delete(trips);

  console.log("Inserting sample data...");

  console.log("Signing up users and assigning roles...");
  for (const user of usersData) {
    console.log(`Creating user: ${user.name} (${user.email})`);
    
    const result = await auth.api.createUser({
        body: {
            name: user.name,
            email: user.email,
            password: user.password,
            role: user.role
        }
    });

    console.log(`User created with ID: ${result.user.id}, role: ${result.user.role}`);
  }

  console.log("Seeding completed successfully!");
}

if (import.meta.main) {
  seed().catch(console.error);
}
