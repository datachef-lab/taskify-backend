/*
 * This file serves as a central export point for all database models defined in the modules.
 * It manually exports each model from their respective module directories and also exports
 * all database enums from the db-enums directory.
 *
 * This exported schema is referenced by drizzle.config.ts for database migrations and operations.
 */

// Export all models from user module
export * from "../modules/user/models/user.model";
export * from "../modules/user/models/role.model";
export * from "../modules/user/models/permission.model";
export * from "../modules/user/models/userDepartment.model";

// Export all models from tasks module
export * from "../modules/tasks/templates/models/taskTemplate.model";
export * from "../modules/tasks/templates/models/fieldTemplate.model";
export * from "../modules/tasks/templates/models/fnTemplate.model";
export * from "../modules/tasks/templates/models/conditionalAction.model";
export * from "../modules/tasks/templates/models/conditionalActionUser.model";
export * from "../modules/tasks/templates/models/dropdownTemplate.model";
export * from "../modules/tasks/templates/models/dropdownItem.model";
export * from "../modules/tasks/templates/models/inputTemplate.model";
export * from "../modules/tasks/templates/models/joins.model";

// Export all models from stakeholders module
export * from "../modules/stakeholders/models/customer.model";
export * from "../modules/stakeholders/models/parentCompany.model";

// Export all DB enums
export * from "../db-enums";
