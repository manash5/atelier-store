CREATE TYPE "public"."product_gender" AS ENUM('women', 'men', 'unisex');--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "gender" "product_gender" DEFAULT 'unisex' NOT NULL;