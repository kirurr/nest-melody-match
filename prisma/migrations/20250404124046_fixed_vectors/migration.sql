-- AlterTable
ALTER TABLE "Genre" ALTER COLUMN "vector" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserPreferences" ALTER COLUMN "genresVector" DROP NOT NULL;
