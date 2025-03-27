import { integer, pgTable, serial } from "drizzle-orm/pg-core";
import { conditionalActionModel } from "./conditionalAction.model";
import { userModel } from "../../../user/models/user.model";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const conditionalActionUserModel = pgTable("conditional_action_users", {
    id: serial().primaryKey(),
    conditionalActionId: integer("conditional_action_id_fk")
        .references(() => conditionalActionModel.id)
        .notNull(),
    userId: integer("user_id_fk")
        .references(() => userModel.id)
        .notNull(),
});

export const conditionalActionUserRelations = relations(conditionalActionUserModel, ({ one }) => ({
    conditionalAction: one(conditionalActionModel, {
        fields: [conditionalActionUserModel.conditionalActionId],
        references: [conditionalActionModel.id],
    }),
    user: one(userModel, {
        fields: [conditionalActionUserModel.userId],
        references: [userModel.id],
    }),
}));

export const createConditionalActionUserSchema = createInsertSchema(conditionalActionUserModel);

export type ConditionalActionUser = z.infer<typeof createConditionalActionUserSchema>;
