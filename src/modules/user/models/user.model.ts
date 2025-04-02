import { boolean, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userModel = pgTable("users", {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(),
    phone: varchar({ length: 15 }).notNull(),
    profileImage: text(),
    isAdmin: boolean().default(false),
    disabled: boolean().default(false),
    refreshToken: varchar({ length: 255 }), // Added refreshToken field
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const createUserSchema = createInsertSchema(userModel);

export type User = z.infer<typeof createUserSchema>;
