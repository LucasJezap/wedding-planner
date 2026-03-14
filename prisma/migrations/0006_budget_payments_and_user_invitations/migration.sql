ALTER TABLE "budget_categories"
ADD COLUMN IF NOT EXISTS "color" TEXT NOT NULL DEFAULT '#D89BAE';

CREATE TABLE IF NOT EXISTS "user_invitations" (
  "id" TEXT NOT NULL,
  "wedding_id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'WITNESS',
  "token" TEXT NOT NULL,
  "accepted_at" TIMESTAMP(3),
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_invitations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_invitations_token_key" ON "user_invitations"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "user_invitations_wedding_id_email_key" ON "user_invitations"("wedding_id", "email");

ALTER TABLE "user_invitations"
ADD CONSTRAINT "user_invitations_wedding_id_fkey"
FOREIGN KEY ("wedding_id") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "expenses"
ADD COLUMN IF NOT EXISTS "estimate_min" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "estimate_max" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "actual_amount" DECIMAL(10,2) NOT NULL DEFAULT 0;

UPDATE "expenses"
SET
  "estimate_min" = COALESCE("estimate_min", "amount"),
  "estimate_max" = COALESCE("estimate_max", "amount"),
  "actual_amount" = COALESCE("actual_amount", "amount");

CREATE TABLE IF NOT EXISTS "payments" (
  "id" TEXT NOT NULL,
  "wedding_id" TEXT NOT NULL,
  "expense_id" TEXT NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "paid_at" TIMESTAMP(3) NOT NULL,
  "notes" TEXT NOT NULL DEFAULT '',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "payments"
ADD CONSTRAINT "payments_wedding_id_fkey"
FOREIGN KEY ("wedding_id") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payments"
ADD CONSTRAINT "payments_expense_id_fkey"
FOREIGN KEY ("expense_id") REFERENCES "expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "payments" ("id", "wedding_id", "expense_id", "amount", "paid_at", "notes", "created_at", "updated_at")
SELECT
  'payment-migrated-' || "id",
  "wedding_id",
  "id",
  "amount",
  "paid_at",
  COALESCE("notes", ''),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "expenses"
WHERE NOT EXISTS (
  SELECT 1 FROM "payments" WHERE "payments"."expense_id" = "expenses"."id"
);

ALTER TABLE "expenses" DROP COLUMN IF EXISTS "amount";
ALTER TABLE "expenses" DROP COLUMN IF EXISTS "paid_at";
