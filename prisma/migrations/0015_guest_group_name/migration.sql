ALTER TABLE "guests"
ADD COLUMN IF NOT EXISTS "group_name" TEXT;

UPDATE "guests" AS g
SET "group_name" = ig."name"
FROM "invitation_groups" AS ig
WHERE g."invitation_group_id" = ig."id"
  AND (g."group_name" IS NULL OR g."group_name" = '');
