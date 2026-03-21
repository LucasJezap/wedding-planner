CREATE TABLE "invitation_groups" (
    "id" TEXT NOT NULL,
    "wedding_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "invited_guest_count" INTEGER NOT NULL DEFAULT 1,
    "allows_plus_one" BOOLEAN NOT NULL DEFAULT FALSE,
    "notes" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitation_groups_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "invitation_groups_wedding_id_name_key" ON "invitation_groups"("wedding_id", "name");

ALTER TABLE "guests"
ADD COLUMN "invitation_group_id" TEXT;

ALTER TABLE "invitation_groups"
ADD CONSTRAINT "invitation_groups_wedding_id_fkey"
FOREIGN KEY ("wedding_id") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "guests"
ADD CONSTRAINT "guests_invitation_group_id_fkey"
FOREIGN KEY ("invitation_group_id") REFERENCES "invitation_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
