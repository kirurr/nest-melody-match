/*
  Warnings:

  - Changed the type of `desiredSex` on the `UserPreferences` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PreferencesSex" AS ENUM ('MALE', 'FEMALE', 'BOTH');

-- AlterTable
ALTER TABLE "UserPreferences" DROP COLUMN "desiredSex",
ADD COLUMN     "desiredSex" "PreferencesSex" NOT NULL;
