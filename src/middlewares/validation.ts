import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { Request, Response, NextFunction } from "express";

export const users = pgTable("users", {
    id: text("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    department: varchar("department", { length: 100 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
});

// Create Zod schemas from your Drizzle schema
export const insertUserSchema = createInsertSchema(users, {
    email: z.string().email(),
    name: z.string().min(2).max(255),
    department: z.string().min(1),
    password: z
        .string()
        .min(8)
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
        ),
});

export const selectUserSchema = createSelectSchema(users);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type SelectUser = z.infer<typeof selectUserSchema>;

export const validateUser = (req: Request, res: Response, next: NextFunction): void => {
    const { name, email } = req.body;

    if (!name || !email) {
        res.status(400).json({ error: "Name and email are required" });
        return;
    }

    next();
};
