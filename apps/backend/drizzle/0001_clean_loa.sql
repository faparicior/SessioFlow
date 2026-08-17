CREATE TABLE "outbox_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aggregate_type" varchar(100) NOT NULL,
	"aggregate_id" varchar(255) NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	"error" text
);
--> statement-breakpoint
CREATE INDEX "idx_outbox_status_created" ON "outbox_messages" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "idx_outbox_aggregate" ON "outbox_messages" USING btree ("aggregate_type","aggregate_id");