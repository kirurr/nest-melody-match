import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ActiveRefreshToken } from '@prisma/client';

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly db: PrismaService) {}

  async find(refreshToken: string): Promise<ActiveRefreshToken | null> {
    return await this.db.activeRefreshToken.findUnique({
      where: { refreshToken },
    });
  }

  async create(
    refreshToken: string,
    userId: number,
  ): Promise<ActiveRefreshToken> {
    return await this.db.activeRefreshToken.create({
      data: {
        userId: userId,
        refreshToken: refreshToken,
      },
    });
  }

  async findByUserId(userId: number): Promise<ActiveRefreshToken | null> {
    return await this.db.activeRefreshToken.findUnique({
      where: { userId: userId },
    });
  }

  async updateByUserId(userId: number, token: string): Promise<void> {
    await this.db.activeRefreshToken.upsert({
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
