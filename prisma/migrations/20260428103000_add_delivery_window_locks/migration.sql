CREATE TABLE "delivery_window_locks" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "type" "DailyDeliveryType" NOT NULL,
  "local_date" DATE NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "delivery_window_locks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "delivery_window_locks_user_id_type_local_date_key"
  ON "delivery_window_locks"("user_id", "type", "local_date");

CREATE INDEX "delivery_window_locks_type_local_date_idx"
  ON "delivery_window_locks"("type", "local_date");

ALTER TABLE "delivery_window_locks"
  ADD CONSTRAINT "delivery_window_locks_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
