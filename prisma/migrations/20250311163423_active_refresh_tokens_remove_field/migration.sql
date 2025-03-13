/*
  Warnings:

  - You are about to drop the column `resolvedAt` on the `ActiveRefreshToken` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ActiveRefreshToken" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "refreshToken" TEXT NOT NULL,
    CONSTRAINT "ActiveRefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ActiveRefreshToken" ("id", "refreshToken", "userId") SELECT "id", "refreshToken", "userId" FROM "ActiveRefreshToken";
DROP TABLE "ActiveRefreshToken";
ALTER TABLE "new_ActiveRefreshToken" RENAME TO "ActiveRefreshToken";
CREATE UNIQUE INDEX "ActiveRefreshToken_userId_key" ON "ActiveRefreshToken"("userId");
CREATE UNIQUE INDEX "ActiveRefreshToken_refreshToken_key" ON "ActiveRefreshToken"("refreshToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
