/*
  Warnings:

  - You are about to drop the `_ProductToPurchase` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProductToPurchase" DROP CONSTRAINT "_ProductToPurchase_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToPurchase" DROP CONSTRAINT "_ProductToPurchase_B_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "purchaseId" TEXT;

-- DropTable
DROP TABLE "_ProductToPurchase";

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
