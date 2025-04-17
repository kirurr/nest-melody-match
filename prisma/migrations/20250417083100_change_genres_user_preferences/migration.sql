/*
  Warnings:

  - You are about to drop the column `genresIds` on the `UserPreferences` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserPreferences" DROP COLUMN "genresIds";

-- CreateTable
CREATE TABLE "_GenreToUserPreferences" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_GenreToUserPreferences_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_GenreToUserPreferences_B_index" ON "_GenreToUserPreferences"("B");

-- AddForeignKey
ALTER TABLE "_GenreToUserPreferences" ADD CONSTRAINT "_GenreToUserPreferences_A_fkey" FOREIGN KEY ("A") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GenreToUserPreferences" ADD CONSTRAINT "_GenreToUserPreferences_B_fkey" FOREIGN KEY ("B") REFERENCES "UserPreferences"("id") ON DELETE CASCADE ON UPDATE CASCADE;
