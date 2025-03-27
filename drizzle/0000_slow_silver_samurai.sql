CREATE TYPE "public"."condition_type" AS ENUM('EQUALS', 'LESS_THAN', 'LESS_THAN_EQUALS', 'GREATER_THAN', 'GREATER_THAN_EQUALS');--> statement-breakpoint
CREATE TYPE "public"."conditional_action_type" AS ENUM('MARK_TASK_AS_DONE', 'MARK_FN_AS_DONE', 'MARK_FIELD_AS_DONE', 'NOTIFY_USERS', 'ADD_DYNAMIC_INPUT');--> statement-breakpoint
CREATE TYPE "public"."department_type" AS ENUM('QUOTATION', 'ACCOUNTS', 'DISPATCH', 'SERVICE', 'CUSTOMER', 'WORKSHOP');--> statement-breakpoint
CREATE TYPE "public"."fn_template_type" AS ENUM('NORMAL', 'SPECIAL');--> statement-breakpoint
CREATE TYPE "public"."input_type" AS ENUM('FILE', 'MULTIPLE_FILES', 'TEXT', 'TEXTAREA', 'NUMBER', 'EMAIL', 'PHONE', 'DROPDOWN', 'AMOUNT', 'TABLE', 'CHECKBOX', 'DATE', 'BOOLEAN', 'RICH_TEXT_EDITOR');--> statement-breakpoint
CREATE TYPE "public"."permission_type" AS ENUM('CREATE', 'READ', 'UPDATE', 'DELETE', 'ALL');--> statement-breakpoint
CREATE TYPE "public"."role_type" AS ENUM('ADMIN', 'OPERATOR', 'SALES', 'MARKETING', 'ACCOUNTS', 'DISPATCH', 'TECHNICIAN', 'SURVEYOR', 'MEMBER');--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"phone" varchar(15) NOT NULL,
	"profile_image" text,
	"is_admin" boolean DEFAULT false,
	"disabled" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"department_id_fk" integer NOT NULL,
	"type" "role_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id_fk" integer NOT NULL,
	"type" "permission_type" DEFAULT 'READ' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id_fk" integer NOT NULL,
	"type" "department_type",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "field_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fn_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(255),
	"department" "department_type" DEFAULT 'SERVICE' NOT NULL,
	"is_choice" boolean DEFAULT false,
	"next_follow_up_fn_template_id_fk" integer,
	"type" "fn_template_type" DEFAULT 'NORMAL' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "condtional_actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"input_template_id_fk" integer,
	"name" varchar(255) NOT NULL,
	"type" "conditional_action_type" DEFAULT 'ADD_DYNAMIC_INPUT',
	"description" varchar(500),
	"targeted_input_template_id_fk" integer,
	"targeted_task_template_id_fk" integer,
	"targeted_fn_template_id_fk" integer,
	"targeted_field_template_id_fk" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conditional_action_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"conditional_action_id_fk" integer NOT NULL,
	"user_id_fk" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dropdown_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"dropdown_item_id_fk" integer NOT NULL,
	"task_template_id_fk" integer,
	"fn_template_id_fk" integer,
	"input_template_id_fk" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dropdown_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "input_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "input_type" DEFAULT 'TEXT' NOT NULL,
	"condition" "condition_type",
	"comparison_value" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "field_template_input_templates" (
	"field_template_id_fk" integer NOT NULL,
	"input_template_id_fk" integer NOT NULL,
	CONSTRAINT "field_template_input_templates_field_template_id_fk_input_template_id_fk_pk" PRIMARY KEY("field_template_id_fk","input_template_id_fk")
);
--> statement-breakpoint
CREATE TABLE "fn_template_field_templates" (
	"fn_template_id_fk" integer NOT NULL,
	"field_template_id_fk" integer NOT NULL,
	CONSTRAINT "fn_template_field_templates_fn_template_id_fk_field_template_id_fk_pk" PRIMARY KEY("fn_template_id_fk","field_template_id_fk")
);
--> statement-breakpoint
CREATE TABLE "task_templates_fn_templates" (
	"task_template_id_fk" integer NOT NULL,
	"fn_template_id_fk" integer NOT NULL,
	CONSTRAINT "task_templates_fn_templates_task_template_id_fk_fn_template_id_fk_pk" PRIMARY KEY("task_template_id_fk","fn_template_id_fk")
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_company_id_fk" integer,
	"name" varchar(900) NOT NULL,
	"email" varchar(255),
	"address" varchar(900),
	"state" varchar(255),
	"city" varchar(255),
	"pincode" varchar(255),
	"person_of_contact" varchar(255),
	"phone" varchar(15),
	"gst" varchar(255),
	"pan" varchar(255),
	"residential_address" varchar(900),
	"birth_date" date,
	"anniversary_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parent_companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(900) NOT NULL,
	"email" varchar(255),
	"address" varchar(900),
	"state" varchar(255),
	"city" varchar(255),
	"pincode" varchar(255),
	"person_of_contact" varchar(255),
	"phone" varchar(15),
	"business_type" varchar(255),
	"head_office_address" varchar(900),
	"remark" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_department_id_fk_user_departments_id_fk" FOREIGN KEY ("department_id_fk") REFERENCES "public"."user_departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_role_id_fk_roles_id_fk" FOREIGN KEY ("role_id_fk") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_departments" ADD CONSTRAINT "user_departments_user_id_fk_users_id_fk" FOREIGN KEY ("user_id_fk") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fn_templates" ADD CONSTRAINT "fn_templates_next_follow_up_fn_template_id_fk_fn_templates_id_fk" FOREIGN KEY ("next_follow_up_fn_template_id_fk") REFERENCES "public"."fn_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "condtional_actions" ADD CONSTRAINT "condtional_actions_input_template_id_fk_input_templates_id_fk" FOREIGN KEY ("input_template_id_fk") REFERENCES "public"."input_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "condtional_actions" ADD CONSTRAINT "condtional_actions_targeted_input_template_id_fk_input_templates_id_fk" FOREIGN KEY ("targeted_input_template_id_fk") REFERENCES "public"."input_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "condtional_actions" ADD CONSTRAINT "condtional_actions_targeted_task_template_id_fk_task_templates_id_fk" FOREIGN KEY ("targeted_task_template_id_fk") REFERENCES "public"."task_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "condtional_actions" ADD CONSTRAINT "condtional_actions_targeted_fn_template_id_fk_fn_templates_id_fk" FOREIGN KEY ("targeted_fn_template_id_fk") REFERENCES "public"."fn_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "condtional_actions" ADD CONSTRAINT "condtional_actions_targeted_field_template_id_fk_field_templates_id_fk" FOREIGN KEY ("targeted_field_template_id_fk") REFERENCES "public"."field_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conditional_action_users" ADD CONSTRAINT "conditional_action_users_conditional_action_id_fk_condtional_actions_id_fk" FOREIGN KEY ("conditional_action_id_fk") REFERENCES "public"."condtional_actions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conditional_action_users" ADD CONSTRAINT "conditional_action_users_user_id_fk_users_id_fk" FOREIGN KEY ("user_id_fk") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dropdown_templates" ADD CONSTRAINT "dropdown_templates_dropdown_item_id_fk_dropdown_items_id_fk" FOREIGN KEY ("dropdown_item_id_fk") REFERENCES "public"."dropdown_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dropdown_templates" ADD CONSTRAINT "dropdown_templates_task_template_id_fk_task_templates_id_fk" FOREIGN KEY ("task_template_id_fk") REFERENCES "public"."task_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dropdown_templates" ADD CONSTRAINT "dropdown_templates_fn_template_id_fk_fn_templates_id_fk" FOREIGN KEY ("fn_template_id_fk") REFERENCES "public"."fn_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dropdown_templates" ADD CONSTRAINT "dropdown_templates_input_template_id_fk_input_templates_id_fk" FOREIGN KEY ("input_template_id_fk") REFERENCES "public"."input_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_template_input_templates" ADD CONSTRAINT "field_template_input_templates_field_template_id_fk_field_templates_id_fk" FOREIGN KEY ("field_template_id_fk") REFERENCES "public"."field_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_template_input_templates" ADD CONSTRAINT "field_template_input_templates_input_template_id_fk_input_templates_id_fk" FOREIGN KEY ("input_template_id_fk") REFERENCES "public"."input_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fn_template_field_templates" ADD CONSTRAINT "fn_template_field_templates_fn_template_id_fk_fn_templates_id_fk" FOREIGN KEY ("fn_template_id_fk") REFERENCES "public"."fn_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fn_template_field_templates" ADD CONSTRAINT "fn_template_field_templates_field_template_id_fk_field_templates_id_fk" FOREIGN KEY ("field_template_id_fk") REFERENCES "public"."field_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_templates_fn_templates" ADD CONSTRAINT "task_templates_fn_templates_task_template_id_fk_task_templates_id_fk" FOREIGN KEY ("task_template_id_fk") REFERENCES "public"."task_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_templates_fn_templates" ADD CONSTRAINT "task_templates_fn_templates_fn_template_id_fk_fn_templates_id_fk" FOREIGN KEY ("fn_template_id_fk") REFERENCES "public"."fn_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_parent_company_id_fk_parent_companies_id_fk" FOREIGN KEY ("parent_company_id_fk") REFERENCES "public"."parent_companies"("id") ON DELETE no action ON UPDATE no action;