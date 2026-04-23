-- CreateEnum
CREATE TYPE "DailyDeliveryType" AS ENUM ('daily', 'weekly', 'monthly_clarity');

-- CreateEnum
CREATE TYPE "DailyDeliveryStatus" AS ENUM ('sent', 'completed', 'skipped');

-- CreateTable
CREATE TABLE "daily_delivery_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "action_id" TEXT,
    "type" "DailyDeliveryType" NOT NULL,
    "status" "DailyDeliveryStatus" NOT NULL DEFAULT 'sent',
    "local_date" DATE NOT NULL,
    "sent_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMPTZ(6),

    CONSTRAINT "daily_delivery_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "daily_delivery_logs_user_id_local_date_type_idx"
ON "daily_delivery_logs"("user_id", "local_date", "type");

-- CreateIndex
CREATE INDEX "daily_delivery_logs_user_id_status_sent_at_idx"
ON "daily_delivery_logs"("user_id", "status", "sent_at");

-- CreateIndex
CREATE INDEX "daily_delivery_logs_action_id_sent_at_idx"
ON "daily_delivery_logs"("action_id", "sent_at");

-- AddForeignKey
ALTER TABLE "daily_delivery_logs"
ADD CONSTRAINT "daily_delivery_logs_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_delivery_logs"
ADD CONSTRAINT "daily_delivery_logs_action_id_fkey"
FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
