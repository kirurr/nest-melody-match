import { Injectable } from '@nestjs/common';
import { AcceptMatch, CreateMatch } from './match.types';
import { PrismaService } from '../prisma.service';
import { Match } from '@prisma/client';

@Injectable()
export class MatchRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findMatchById(id: number): Promise<Match | null> {
    return await this.prismaService.match.findUnique({
      where: {
        id,
      },
    });
  }

  async getUnacceptedMatchesForUser(userId: number): Promise<Match[]> {
    return await this.prismaService.match.findMany({
      where: {
        likedUserId: userId,
        isAccepted: false
      },
    });
  }

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
        OR: [
          {
            userId: userId,
          },
          {
            likedUserId: userId,
          },
        ],
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
