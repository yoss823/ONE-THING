CREATE TABLE "user_checkins" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "mood" TEXT NOT NULL,
  "note" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_checkins_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "user_checkins_user_id_created_at_idx"
  ON "user_checkins"("user_id", "created_at");

ALTER TABLE "user_checkins"
  ADD CONSTRAINT "user_checkins_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
