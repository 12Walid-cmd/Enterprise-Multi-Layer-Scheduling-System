-- CreateTable
CREATE TABLE "ems"."domain_users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "domain_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "domain_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "domain_users_domain_id_user_id_key" ON "ems"."domain_users"("domain_id", "user_id");

-- AddForeignKey
ALTER TABLE "ems"."domain_users" ADD CONSTRAINT "domain_users_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "ems"."domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."domain_users" ADD CONSTRAINT "domain_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ems"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
