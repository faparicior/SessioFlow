CREATE TABLE "conferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(1000) DEFAULT '',
	"slug" varchar(200) NOT NULL,
	"status" varchar(20) DEFAULT 'DRAFT' NOT NULL,
	"organizer_id" uuid NOT NULL,
	"cfp_config" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "conferences_slug_unique" ON "conferences" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_conferences_organizer_id" ON "conferences" USING btree ("organizer_id");--> statement-breakpoint
CREATE INDEX "idx_conferences_status" ON "conferences" USING btree ("status");

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conferences_updated_at
  BEFORE UPDATE ON conferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

