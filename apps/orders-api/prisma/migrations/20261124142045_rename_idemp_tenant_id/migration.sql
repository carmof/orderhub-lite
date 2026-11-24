/*
  Warnings:

  - The primary key for the `idempotency_keys` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `tenantId` on the `idempotency_keys` table. All the data in the column will be lost.
  - Added the required column `tenant_id` to the `idempotency_keys` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "idempotency_keys" DROP CONSTRAINT "idempotency_keys_pkey",
DROP COLUMN "tenantId",
ADD COLUMN     "tenant_id" UUID NOT NULL,
ADD CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("tenant_id", "key");
