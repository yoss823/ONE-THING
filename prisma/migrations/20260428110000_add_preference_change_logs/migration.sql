CREATE TABLE "preference_change_logs" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "preference_change_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "preference_change_logs_user_id_created_at_idx"
  ON "preference_change_logs"("user_id", "created_at");

ALTER TABLE "preference_change_logs"
  ADD CONSTRAINT "preference_change_logs_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
