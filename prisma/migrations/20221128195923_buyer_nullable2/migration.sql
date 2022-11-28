/*
  Warnings:

  - Made the column `authorId` on table `Gift` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Gift" DROP CONSTRAINT "Gift_buyerId_fkey";

-- AlterTable
ALTER TABLE "Gift" ALTER COLUMN "buyerId" DROP NOT NULL,
ALTER COLUMN "authorId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Gift" ADD CONSTRAINT "Gift_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
