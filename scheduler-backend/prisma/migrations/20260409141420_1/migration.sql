-- CreateTable
CREATE TABLE "ems"."global_role_permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "role_id" UUID NOT NULL,
    "permission" TEXT NOT NULL,

    CONSTRAINT "global_role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "global_role_permissions_role_id_permission_key" ON "ems"."global_role_permissions"("role_id", "permission");

-- AddForeignKey
ALTER TABLE "ems"."global_role_permissions" ADD CONSTRAINT "global_role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "ems"."global_role_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
