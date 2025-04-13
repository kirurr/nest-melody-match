import { Injectable } from '@nestjs/common';
import { AcceptMatch, CreateMatch } from './match.types';
import { PrismaService } from '../prisma.service';
import { Match } from '@prisma/client';

@Injectable()
export class MatchRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createMatch(data: CreateMatch): Promise<void> {
    await this.prismaService.match.create({
      data: {
        whoLikes: {
          connect: {
            id: data.whoLikes,
          },
        },
        whoIsLiked: {
          connect: {
            id: data.whoIsLiked,
          },
        },
      },
    });
  }

  async getAcceptedMatches(userId: number): Promise<Match[]> {
    return await this.prismaService.match.findMany({
      where: {
        userId: userId,
        isAccepted: true,
      },
    });
  }
  async acceptMatch(data: AcceptMatch): Promise<void> {
    await this.prismaService.match.update({
      where: {
        id: data.id,
        whoIsLiked: {
          id: data.userId,
        },
      },
      data: {
        isAccepted: true,
      },
    });
  }
}
