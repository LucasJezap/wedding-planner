ALTER TABLE "weddings"
ADD COLUMN "parking_info" TEXT,
ADD COLUMN "accommodation_info" TEXT,
ADD COLUMN "registry_info" TEXT,
ADD COLUMN "transport_info" TEXT,
ADD COLUMN "coordinator_name" TEXT,
ADD COLUMN "coordinator_phone" TEXT,
ADD COLUMN "coordinator_email" TEXT;

ALTER TABLE "tasks"
ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "blocked_by_task_ids" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
