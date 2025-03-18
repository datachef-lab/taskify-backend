import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  vector,
  boolean,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// export const tenantsTable = pgTable("tenants", {
//   id: uuid()
//     .default(sql`public.uuid_generate_v4()`)
//     .primaryKey()
//     .notNull(),
//   name: text(),
//   created: timestamp({ mode: "string" })
//     .default(sql`LOCALTIMESTAMP`)
//     .notNull(),
//   updated: timestamp({ mode: "string" })
//     .default(sql`LOCALTIMESTAMP`)
//     .notNull(),
//   deleted: timestamp({ mode: "string" }),
// });

export const todos = pgTable("todos", {
  id: uuid().defaultRandom(),
  tenantId: uuid("tenant_id"),
  title: varchar({ length: 256 }),
  estimate: varchar({ length: 256 }),
  embedding: vector({ dimensions: 3 }),
  complete: boolean(),
});
