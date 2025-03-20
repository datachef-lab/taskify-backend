import { integer, pgEnum, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { userModel } from "./user.model";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const userDepartmentTypeEnum = pgEnum("user_department_type", [
    "QUOTATION",
    "ACCOUNTS",
    "DISPATCH",
    "SERVICE",
    "CUSTOMER",
    "WORKSHOP",
]);

export const userDepartmentModel = pgTable("user_departments", {
    id: serial().primaryKey(),
    userId: integer("user_id_fk")
        .notNull()
        .references(() => userModel.id),
    type: userDepartmentTypeEnum(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const userDepartmentRelations = relations(userDepartmentModel, ({ one }) => ({
    user: one(userModel, {
        fields: [userDepartmentModel.userId],
        references: [userModel.id],
    }),
}));

export const createUserDepartmentSchema = createInsertSchema(userDepartmentModel);

export type UserDepartment = z.infer<typeof createUserDepartmentSchema>;
