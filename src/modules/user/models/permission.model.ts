import { integer, pgEnum, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { roleModel } from "./role.model";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const permissionTypeEnum = pgEnum("permission_type", ["CREATE", "READ", "UPDATE", "DELETE", "ALL"]);

export const permissionModel = pgTable("permissions", {
    id: serial().primaryKey(),
    roleId: integer("role_id_fk")
        .notNull()
        .references(() => roleModel.id),
    type: permissionTypeEnum().notNull().default("READ"),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const permissionRelations = relations(permissionModel, ({ one }) => ({
    role: one(roleModel, {
        fields: [permissionModel.roleId],
        references: [roleModel.id],
    }),
}));

export const createPermissionSchema = createInsertSchema(permissionModel);

export type Permission = z.infer<typeof createPermissionSchema>;
