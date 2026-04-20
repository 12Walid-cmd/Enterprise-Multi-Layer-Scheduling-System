-- CreateTable
CREATE TABLE "ems"."user_resource_scope" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" UUID NOT NULL,

    CONSTRAINT "user_resource_scope_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_resource_scope_user_id_idx" ON "ems"."user_resource_scope"("user_id");

-- CreateIndex
CREATE INDEX "user_resource_scope_resource_type_resource_id_idx" ON "ems"."user_resource_scope"("resource_type", "resource_id");

-- AddForeignKey
ALTER TABLE "ems"."user_resource_scope" ADD CONSTRAINT "user_resource_scope_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ems"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
