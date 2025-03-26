import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { userDepartmentModel } from "./userDepartment.model";
import { relations } from "drizzle-orm";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { roleTypeEnum } from "../../../db-enums";

export const roleModel = pgTable("roles", {
    id: serial().primaryKey(),
    departmentId: integer("department_id_fk")
        .notNull()
        .references(() => userDepartmentModel.id),
    type: roleTypeEnum().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const roleRelations = relations(roleModel, ({ one }) => ({
    department: one(userDepartmentModel, {
        fields: [roleModel.departmentId],
        references: [userDepartmentModel.id],
    }),
}));

export const createRoleSchema = createInsertSchema(roleModel);

export type Role = z.infer<typeof createRoleSchema>;
