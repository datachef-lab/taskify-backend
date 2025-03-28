CREATE TYPE "public"."activity_type" AS ENUM('LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'IMPORT', 'ASSIGN', 'COMPLETE', 'APPROVE', 'REJECT', 'COMMENT', 'NOTIFICATION', 'ERROR', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."entity_type" AS ENUM('TASK', 'FUNCTION', 'FIELD', 'INPUT', 'USER', 'CUSTOMER', 'REPORT', 'NOTIFICATION', 'SETTING', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."statistic_type" AS ENUM('TASK_COMPLETION_RATE', 'AVERAGE_TASK_DURATION', 'USER_ACTIVITY', 'TASK_DISTRIBUTION', 'RESPONSE_TIME', 'ERROR_RATE', 'RESOURCE_USAGE', 'CUSTOMER_ENGAGEMENT', 'PERFORMANCE_METRIC', 'CUSTOM_METRIC');--> statement-breakpoint
CREATE TYPE "public"."time_period" AS ENUM('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM');--> statement-breakpoint
CREATE TYPE "public"."metric_type" AS ENUM('API_RESPONSE_TIME', 'DATABASE_QUERY_TIME', 'RENDERING_TIME', 'MEMORY_USAGE', 'CPU_USAGE', 'NETWORK_LATENCY', 'ERROR_COUNT', 'REQUEST_COUNT', 'CONCURRENT_USERS', 'SYSTEM_METRIC');--> statement-breakpoint
CREATE TYPE "public"."priority_type" AS ENUM('NORMAL', 'MEDIUM', 'HIGH');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"activity_type" "activity_type" NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	"entity_id" integer NOT NULL,
	"user_id_fk" integer NOT NULL,
	"ip_address" varchar(45),
	"description" varchar(500) NOT NULL,
	"details" jsonb,
	"status_code" integer,
	"tags" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "statistics" (
	"id" serial PRIMARY KEY NOT NULL,
	"statistic_type" "statistic_type" NOT NULL,
	"time_period" time_period NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(100),
	"description" varchar(500),
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"data" jsonb NOT NULL,
	"dimensions" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "performance_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"metric_type" "metric_type" NOT NULL,
	"operation" varchar(255) NOT NULL,
	"duration_ms" double precision NOT NULL,
	"http_method" varchar(10),
	"status_code" integer,
	"entity_type" varchar(100),
	"entity_id" integer,
	"user_id" integer,
	"request_details" jsonb,
	"response_size" integer,
	"ip_address" varchar(45),
	"user_agent" varchar(500),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "condtional_actions" RENAME COLUMN "type" TO "action";--> statement-breakpoint
ALTER TABLE "condtional_actions" ADD COLUMN "condition" "condition_type";--> statement-breakpoint
ALTER TABLE "condtional_actions" ADD COLUMN "comparison_value" varchar(255);--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fk_users_id_fk" FOREIGN KEY ("user_id_fk") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "input_templates" DROP COLUMN "condition";--> statement-breakpoint
ALTER TABLE "input_templates" DROP COLUMN "comparison_value";