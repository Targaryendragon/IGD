/*
  Warnings:

  - Added the required column `summary` to the `Article` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Article" ADD COLUMN "coverImage" TEXT;
ALTER TABLE "Article" ADD COLUMN "summary" TEXT;
UPDATE "Article" SET "summary" = substring(content, 1, 200) WHERE "summary" IS NULL;
ALTER TABLE "Article" ALTER COLUMN "summary" SET NOT NULL;
