/*
  Warnings:

  - You are about to drop the column `purchaseId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `_ProductToPurchase` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProductToPurchase" DROP CONSTRAINT "_ProductToPurchase_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToPurchase" DROP CONSTRAINT "_ProductToPurchase_B_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "purchaseId";

-- DropTable
DROP TABLE "_ProductToPurchase";

-- CreateTable
CREATE TABLE "_ProductPurchases" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProductPurchases_AB_unique" ON "_ProductPurchases"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductPurchases_B_index" ON "_ProductPurchases"("B");

-- AddForeignKey
ALTER TABLE "_ProductPurchases" ADD CONSTRAINT "_ProductPurchases_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductPurchases" ADD CONSTRAINT "_ProductPurchases_B_fkey" FOREIGN KEY ("B") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
