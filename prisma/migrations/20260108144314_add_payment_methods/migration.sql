-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('BANK', 'PAYPAL', 'MOBILE_MONEY');

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "PaymentMethodType" NOT NULL,
    "bank_name" VARCHAR(100),
    "account_number" VARCHAR(50),
    "account_name" VARCHAR(100),
    "paypal_email" VARCHAR(255),
    "phone_number" VARCHAR(20),
    "provider" VARCHAR(50),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_methods_user_id_idx" ON "payment_methods"("user_id");

-- CreateIndex
CREATE INDEX "payment_methods_user_id_is_default_idx" ON "payment_methods"("user_id", "is_default");

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
