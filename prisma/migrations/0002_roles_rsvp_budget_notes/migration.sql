-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'WITNESS');

-- CreateEnum
CREATE TYPE "PaymentCoverage" AS ENUM ('FULL', 'HALF');

-- AlterTable
ALTER TABLE "users"
ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'ADMIN';

-- AlterTable
ALTER TABLE "guests"
ADD COLUMN "rsvp_token" TEXT,
ADD COLUMN "payment_coverage" "PaymentCoverage" NOT NULL DEFAULT 'FULL',
ADD COLUMN "transport_to_venue" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "transport_from_venue" BOOLEAN NOT NULL DEFAULT false;

-- Backfill existing guest tokens before the unique constraint is created.
UPDATE "guests"
SET "rsvp_token" = UPPER(SUBSTRING(MD5("id") FOR 10))
WHERE "rsvp_token" IS NULL;

-- AlterTable
ALTER TABLE "guests"
ALTER COLUMN "rsvp_token" SET NOT NULL;

-- AlterTable
ALTER TABLE "budget_categories"
ADD COLUMN "notes" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "expenses"
ADD COLUMN "notes" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "guests_rsvp_token_key" ON "guests"("rsvp_token");
