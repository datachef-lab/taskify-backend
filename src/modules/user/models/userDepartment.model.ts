import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { userModel } from "./user.model";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { departmentTypeEnum } from "../../../db-enums";

export const userDepartmentModel = pgTable("user_departments", {
    id: serial().primaryKey(),
    userId: integer("user_id_fk")
        .notNull()
        .references(() => userModel.id),
    type: departmentTypeEnum(),
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
