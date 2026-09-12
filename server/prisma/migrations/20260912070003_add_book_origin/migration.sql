-- CreateEnum
CREATE TYPE "BookOrigin" AS ENUM ('mongolian', 'foreign');

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "origin" "BookOrigin" NOT NULL DEFAULT 'foreign';

-- CreateIndex
CREATE INDEX "Book_origin_idx" ON "Book"("origin");
