import { pgEnum } from "drizzle-orm/pg-core";

export const permissionTypeEnum = pgEnum("permission_type", ["CREATE", "READ", "UPDATE", "DELETE", "ALL"]);

export const roleTypeEnum = pgEnum("role_type", [
    "ADMIN",
    "OPERATOR",
    "SALES",
    "MARKETING",
    "ACCOUNTS",
    "DISPATCH",
    "TECHNICIAN",
    "SURVEYOR",
    "MEMBER",
]);

export const departmentTypeEnum = pgEnum("department_type", [
    "QUOTATION",
    "ACCOUNTS",
    "DISPATCH",
    "SERVICE",
    "CUSTOMER",
    "WORKSHOP",
]);

export const fnTemplateTypeEnum = pgEnum("fn_template_type", ["NORMAL", "SPECIAL"]);

export const inputTypeEnum = pgEnum("input_type", [
    "FILE",
    "MULTIPLE_FILES",
    "TEXT",
    "TEXTAREA",
    "NUMBER",
    "EMAIL",
    "PHONE",
    "DROPDOWN",
    "AMOUNT",
    "TABLE",
    "CHECKBOX",
    "DATE",
    "BOOLEAN",
    "RICH_TEXT_EDITOR",
]);

export const conditionTypeEnum = pgEnum("condition_type", [
    "EQUALS",
    "LESS_THAN",
    "LESS_THAN_EQUALS",
    "GREATER_THAN",
    "GREATER_THAN_EQUALS",
]);

export const conditionalActionTypeEnum = pgEnum("conditional_action_type", [
    "MARK_TASK_AS_DONE",
    "MARK_FN_AS_DONE",
    "MARK_FIELD_AS_DONE",
    "NOTIFY_USERS",
    "ADD_DYNAMIC_INPUT",
    // "ADD_DATA"
]);

export const priorityType = pgEnum("priority_type", ["NORMAL", "MEDIUM", "HIGH"]);

// Analytics Enums
export { activityTypeEnum, entityTypeEnum } from "../modules/analytics/models/activityLog.model";
export { statisticTypeEnum, timePeriodEnum } from "../modules/analytics/models/statistic.model";
export { metricTypeEnum } from "../modules/analytics/models/performanceMetric.model";
