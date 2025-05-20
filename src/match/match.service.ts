import { BadRequestException, Injectable } from '@nestjs/common';
import { AcceptMatch, CreateMatch } from './match.types';
import { MatchRepository } from './match.repository';
import { Match } from '@prisma/client';

@Injectable()
export class MatchService {
  constructor(private readonly matchRepository: MatchRepository) {}

  async getUnacceptedMatchesForUser(userId: number): Promise<Match[]> {
    return await this.matchRepository.getUnacceptedMatchesForUser(userId);
  }

  async createMatch(data: CreateMatch): Promise<void> {
    return await this.matchRepository.createMatch(data);
  }

  async getAcceptedMatches(userId: number): Promise<Match[]> {
    return await this.matchRepository.getAcceptedMatches(userId);
  }

  async acceptMatch(data: AcceptMatch): Promise<void> {
    const match = await this.matchRepository.findMatchById(data.id)
    if (!match) {
      throw new BadRequestException('Match not found, probably user is deleted');
    }
    return await this.matchRepository.acceptMatch(data);
  }
}
