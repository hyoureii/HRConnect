import { pgEnum } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("request_status", ["pending", "approved", "refused"]);
