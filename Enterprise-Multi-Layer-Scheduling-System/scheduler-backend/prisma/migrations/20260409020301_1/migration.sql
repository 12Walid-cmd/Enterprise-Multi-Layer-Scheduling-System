-- CreateTable
CREATE TABLE "ems"."user_permissions" (
    "user_id" UUID NOT NULL,
    "permission" TEXT NOT NULL,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("user_id","permission")
);

-- AddForeignKey
ALTER TABLE "ems"."user_permissions" ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ems"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
