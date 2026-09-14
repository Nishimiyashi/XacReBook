-- AlterTable
ALTER TABLE "Book" DROP COLUMN "increment",
ADD COLUMN     "marketPrice" INTEGER,
ADD COLUMN     "condition" TEXT;
