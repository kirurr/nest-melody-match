-- CreateTable
CREATE TABLE "ResolvedRefreshToken" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "refreshToken" TEXT NOT NULL,
    "resolvedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ResolvedRefreshToken_refreshToken_key" ON "ResolvedRefreshToken"("refreshToken");
