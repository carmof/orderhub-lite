/*
  Warnings:

  - The `status` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `state` on the `idempotency_keys` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "idempotency_state" AS ENUM ('in_progress', 'done');

-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('pending', 'reserved', 'paid', 'shipped', 'cancelled');

-- CreateEnum
CREATE TYPE "currency" AS ENUM ('brl');

-- AlterTable
ALTER TABLE "idempotency_keys" DROP COLUMN "state",
ADD COLUMN     "state" "idempotency_state" NOT NULL;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "status",
ADD COLUMN     "status" "order_status" NOT NULL DEFAULT 'pending';

-- DropEnum
DROP TYPE "Currency";

-- DropEnum
DROP TYPE "IdempotencyState";

-- DropEnum
DROP TYPE "OrderStatus";

-- CreateIndex
CREATE INDEX "orders_tenant_id_status_created_at_idx" ON "orders"("tenant_id", "status", "created_at" DESC);
