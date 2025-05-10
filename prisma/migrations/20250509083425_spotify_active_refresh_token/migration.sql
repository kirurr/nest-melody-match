-- CreateTable
CREATE TABLE "SpotifyActiveRefreshToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "refreshToken" TEXT NOT NULL,

    CONSTRAINT "SpotifyActiveRefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyActiveRefreshToken_userId_key" ON "SpotifyActiveRefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyActiveRefreshToken_refreshToken_key" ON "SpotifyActiveRefreshToken"("refreshToken");

-- AddForeignKey
ALTER TABLE "SpotifyActiveRefreshToken" ADD CONSTRAINT "SpotifyActiveRefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
