/*
  Warnings:

  - You are about to drop the `ResolvedRefreshToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ResolvedRefreshToken";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ActiveRefreshTokens" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "resolvedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActiveRefreshTokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ActiveRefreshTokens_userId_key" ON "ActiveRefreshTokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ActiveRefreshTokens_refreshToken_key" ON "ActiveRefreshTokens"("refreshToken");
