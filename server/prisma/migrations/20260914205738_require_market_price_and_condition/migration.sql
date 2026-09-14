-- Backfill existing rows before enforcing NOT NULL below. Books created
-- while these columns were optional don't have real values, so fall back to
-- a clearly-placeholder value the admin can edit per book.
UPDATE "Book" SET "marketPrice" = "startingPrice" WHERE "marketPrice" IS NULL;
UPDATE "Book" SET "condition" = 'Тодорхойгүй' WHERE "condition" IS NULL;

-- AlterTable
ALTER TABLE "Book" ALTER COLUMN "marketPrice" SET NOT NULL,
ALTER COLUMN "condition" SET NOT NULL;
