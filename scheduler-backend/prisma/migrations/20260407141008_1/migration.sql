-- CreateTable
CREATE TABLE "ems"."user_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "refresh_token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "revoked_reason" VARCHAR(255),
    "user_agent" VARCHAR(512),
    "ip_address" VARCHAR(64),
    "device_id" VARCHAR(128),
    "last_used_at" TIMESTAMPTZ(6),
    "metadata" JSON,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_user_sessions_user_id" ON "ems"."user_sessions"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_sessions_expires_at" ON "ems"."user_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "idx_user_sessions_revoked_at" ON "ems"."user_sessions"("revoked_at");

-- AddForeignKey
ALTER TABLE "ems"."user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ems"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
