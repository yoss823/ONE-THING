ALTER TABLE "users"
ADD COLUMN "timezone" TEXT;

ALTER TABLE "daily_sends"
ALTER COLUMN "action_id" DROP NOT NULL;

CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");
