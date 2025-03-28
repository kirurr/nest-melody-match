/*
  Warnings:

  - Made the column `vector` on table `Genre` required. This step will fail if there are existing NULL values in that column.
  - Made the column `genresVector` on table `UserPreferences` required. This step will fail if there are existing NULL values in that column.
  - Made the column `desiredSex` on table `UserPreferences` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Genre" ALTER COLUMN "vector" SET NOT NULL;

-- AlterTable
ALTER TABLE "UserPreferences" ALTER COLUMN "genresVector" SET NOT NULL,
ALTER COLUMN "desiredSex" SET NOT NULL;
