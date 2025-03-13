/*
  Warnings:

  - You are about to drop the `ActiveRefreshTokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ActiveRefreshTokens";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ActiveRefreshToken" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "resolvedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActiveRefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ActiveRefreshToken_userId_key" ON "ActiveRefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ActiveRefreshToken_refreshToken_key" ON "ActiveRefreshToken"("refreshToken");
