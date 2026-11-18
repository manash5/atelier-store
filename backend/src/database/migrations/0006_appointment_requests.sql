CREATE TYPE "public"."appointment_status" AS ENUM('new', 'contacted');--> statement-breakpoint
CREATE TYPE "public"."appointment_type" AS ENUM('in_store', 'video');--> statement-breakpoint
CREATE TABLE "appointment_requests" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "appointment_requests_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"type" "appointment_type" DEFAULT 'in_store' NOT NULL,
	"preferred_date" date,
	"note" text,
	"status" "appointment_status" DEFAULT 'new' NOT NULL,
	"user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointment_requests" ADD CONSTRAINT "appointment_requests_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "appointment_requests_created_at_idx" ON "appointment_requests" USING btree ("created_at" DESC NULLS LAST,"id" DESC NULLS LAST);