-- AddForeignKey
ALTER TABLE "ems"."user_permissions" ADD CONSTRAINT "user_permissions_permission_fkey" FOREIGN KEY ("permission") REFERENCES "ems"."permission_types"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
