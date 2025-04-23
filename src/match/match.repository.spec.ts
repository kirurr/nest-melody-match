import { Test, TestingModule } from '@nestjs/testing';
import { MatchRepository } from './match.repository';
import { PrismaService } from '../prisma.service';
import { AcceptMatch, CreateMatch } from './match.types';
import { Match } from '@prisma/client';

describe('MatchRepository', () => {
  let matchRepository: MatchRepository;
  //eslint-disable-next-line
  let prismaService: PrismaService;

  const mockPrismaService = {
    match: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    matchRepository = module.get<MatchRepository>(MatchRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(matchRepository).toBeDefined();
  });

  describe('acceptMatch', () => {
    it('should accept a match in the database', async () => {
      const data = {
        id: 1,
        userId: 2,
      } as AcceptMatch;

      await matchRepository.acceptMatch(data);

      expect(mockPrismaService.match.update).toHaveBeenCalledWith({
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
    });
  });

  describe('createMatch', () => {
    it('should create a match in the database', async () => {
      const matchData: CreateMatch = {
        whoLikes: 1,
        whoIsLiked: 2,
      };

      await matchRepository.createMatch(matchData);

      expect(mockPrismaService.match.create).toHaveBeenCalledWith({
        data: {
          whoLikes: {
            connect: {
              id: matchData.whoLikes,
            },
          },
          whoIsLiked: {
            connect: {
              id: matchData.whoIsLiked,
            },
          },
        },
      });
    });
  });

  describe('getAcceptedMatches', () => {
    it('should return accepted matches for the user', async () => {
      const userId = 1;
      const mockMatches: Match[] = [
        { id: 1, userId: 1, likedUserId: 2, isAccepted: true } as Match,
        { id: 2, userId: 1, likedUserId: 3, isAccepted: true } as Match,
      ];

      mockPrismaService.match.findMany.mockResolvedValue(mockMatches);

      const result = await matchRepository.getAcceptedMatches(userId);

      expect(result).toEqual(mockMatches);
      expect(mockPrismaService.match.findMany).toHaveBeenCalledWith({
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
    });

    it('should return an empty array if no accepted matches are found', async () => {
      const userId = 1;

      mockPrismaService.match.findMany.mockResolvedValue([]);

      const result = await matchRepository.getAcceptedMatches(userId);

      expect(result).toEqual([]);
      expect(mockPrismaService.match.findMany).toHaveBeenCalledWith({
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
    });
  });
});
