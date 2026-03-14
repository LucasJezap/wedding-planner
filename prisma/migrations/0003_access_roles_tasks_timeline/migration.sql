-- Extend user roles
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'READ_ONLY';

-- Extend vendor categories
ALTER TYPE "VendorCategoryType" ADD VALUE IF NOT EXISTS 'WEDDING_PLANNER';
ALTER TYPE "VendorCategoryType" ADD VALUE IF NOT EXISTS 'CONTENT_CREATOR';
ALTER TYPE "VendorCategoryType" ADD VALUE IF NOT EXISTS 'MAKEUP';
ALTER TYPE "VendorCategoryType" ADD VALUE IF NOT EXISTS 'HAIR';
ALTER TYPE "VendorCategoryType" ADD VALUE IF NOT EXISTS 'PRIEST';

-- Create task assignee enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TaskAssignee') THEN
    CREATE TYPE "TaskAssignee" AS ENUM ('GROOM', 'BRIDE', 'COUPLE', 'WITNESSES');
  END IF;
END $$;

-- Add task assignee support
ALTER TABLE "tasks"
ADD COLUMN IF NOT EXISTS "assignee" "TaskAssignee" NOT NULL DEFAULT 'COUPLE';

-- Add public timeline visibility flag
ALTER TABLE "timeline_events"
ADD COLUMN IF NOT EXISTS "visible_to_guests" BOOLEAN NOT NULL DEFAULT true;
