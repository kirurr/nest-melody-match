-- AlterTable
ALTER TABLE "UserPreferences" ADD COLUMN     "genresIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
