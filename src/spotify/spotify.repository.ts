import { Injectable } from "@nestjs/common";
import { SpotifyActiveRefreshToken } from "@prisma/client";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class SpotifyRepository {
	constructor(private readonly db: PrismaService) {}
  async find(refreshToken: string): Promise<SpotifyActiveRefreshToken | null> {
    return await this.db.spotifyActiveRefreshToken.findUnique({
      where: { refreshToken },
    });
  }

  async create(
    refreshToken: string,
    userId: number,
  ): Promise<SpotifyActiveRefreshToken> {
    return await this.db.spotifyActiveRefreshToken.create({
      data: {
        userId: userId,
        refreshToken: refreshToken,
      },
    });
  }

  async findByUserId(userId: number): Promise<SpotifyActiveRefreshToken | null> {
    return await this.db.spotifyActiveRefreshToken.findUnique({
      where: { userId: userId },
    });
  }

  async updateByUserId(userId: number, token: string): Promise<void> {
    await this.db.spotifyActiveRefreshToken.upsert({
      where: { userId: userId },
      update: {
        refreshToken: token,
      },
      create: {
        userId: userId,
        refreshToken: token,
      },
    });
  }
}