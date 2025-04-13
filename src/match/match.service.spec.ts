import { Test, TestingModule } from '@nestjs/testing';
import { MatchService } from './match.service';
import { MatchRepository } from './match.repository';
import { Match } from '@prisma/client';
import { AcceptMatch, CreateMatch } from './match.types';

describe('MatchService', () => {
  let matchService: MatchService;
  //eslint-disable-next-line
  let matchRepository: MatchRepository;

  const mockMatchRepository = {
    createMatch: jest.fn(),
    getAcceptedMatches: jest.fn(),
    acceptMatch: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchService,
        {
          provide: MatchRepository,
          useValue: mockMatchRepository,
        },
      ],
    }).compile();

    matchService = module.get<MatchService>(MatchService);
    matchRepository = module.get<MatchRepository>(MatchRepository);
  });

  it('should be defined', () => {
    expect(matchService).toBeDefined();
  });

  describe('accept match', () => {
    it('should call matchRepository.accpetMatch with correct data', async () => {
      const data = {
        id: 1,
        userId: 2,
      } as AcceptMatch;

      await matchService.acceptMatch(data);

      expect(mockMatchRepository.acceptMatch).toHaveBeenCalledWith(data);
    });
  });

  describe('createMatch', () => {
    it('should call matchRepository.createMatch with correct data', async () => {
      const matchData: CreateMatch = {
        whoIsLiked: 1,
        whoLikes: 2,
      };

      await matchService.createMatch(matchData);

      expect(mockMatchRepository.createMatch).toHaveBeenCalledWith(matchData);
    });
  });

  describe('getAcceptedMatches', () => {
    it('should return accepted matches for the user', async () => {
      const userId = 1;
      const mockMatches: Match[] = [
        { id: 1, userId: 1 /* другие поля */ } as Match,
        { id: 2, userId: 1 /* другие поля */ } as Match,
      ];

      mockMatchRepository.getAcceptedMatches.mockResolvedValue(mockMatches);

      const result = await matchService.getAcceptedMatches(userId);

      expect(result).toEqual(mockMatches);
      expect(mockMatchRepository.getAcceptedMatches).toHaveBeenCalledWith(
        userId,
      );
    });

    it('should return an empty array if no accepted matches are found', async () => {
      const userId = 1;

      mockMatchRepository.getAcceptedMatches.mockResolvedValue([]);

      const result = await matchService.getAcceptedMatches(userId);

      expect(result).toEqual([]);
      expect(mockMatchRepository.getAcceptedMatches).toHaveBeenCalledWith(
        userId,
      );
    });
  });
});
