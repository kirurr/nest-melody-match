import { BadRequestException, Injectable } from '@nestjs/common';
import { AcceptMatch, CreateMatch } from './match.types';
import { MatchRepository } from './match.repository';
import { Match } from '@prisma/client';
import { UserDto } from 'src/user/dto/user-dto';
import { UserService } from 'src/user/user.service';
import { UserDataMatchDTO } from './dto/user-data-match.dto';

@Injectable()
export class MatchService {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly userService: UserService,
  ) {}

  async getUnacceptedMatchesForUser(userId: number): Promise<UserDataMatchDTO[]> {
    const matches = await this.matchRepository.getUnacceptedMatchesForUser(userId);

    const users: UserDto[] = [];
    await Promise.all(
      matches.map(async (match) => {
        {
          const user = await this.userService.getUser(
            match.userId,
          );
          if (user) users.push(user);
        }
      }),
    );
    return matches.map(item => {
			return {
				match: item,
				user: users.find(user => user.id === item.userId)!
			}
		});
  }

  async createMatch(data: CreateMatch): Promise<void> {
    return await this.matchRepository.createMatch(data);
  }

  async getAcceptedMatches(userId: number): Promise<UserDto[]> {
    const matches = await this.matchRepository.getAcceptedMatches(userId);
    const users: UserDto[] = [];
    await Promise.all(
      matches.map(async (match) => {
        {
          const user = await this.userService.getMatchedUser(
            match.likedUserId == userId ? match.userId : match.likedUserId,
            userId,
          );
          if (user) users.push(user);
        }
      }),
    );
    return users;
  }

  async acceptMatch(data: AcceptMatch): Promise<void> {
    const match = await this.matchRepository.findMatchById(data.id);
    if (!match) {
      throw new BadRequestException(
        'Match not found, probably user is deleted',
      );
    }
    return await this.matchRepository.acceptMatch(data);
  }
}
