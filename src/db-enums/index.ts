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
