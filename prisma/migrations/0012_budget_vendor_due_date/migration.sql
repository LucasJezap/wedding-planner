ALTER TABLE "expenses"
ADD COLUMN "vendor_id" TEXT,
ADD COLUMN "due_date" TIMESTAMP(3);

ALTER TABLE "expenses"
ADD CONSTRAINT "expenses_vendor_id_fkey"
FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
