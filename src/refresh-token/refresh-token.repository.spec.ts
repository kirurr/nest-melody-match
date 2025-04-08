import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenRepository } from './refresh-token.repository';
import { PrismaService } from '../prisma.service';
import { ActiveRefreshToken } from '@prisma/client';

describe('RefreshTokenRepository', () => {
  let refreshTokenRepository: RefreshTokenRepository;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let prismaService: PrismaService;

  const mockPrismaService = {
    activeRefreshToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    refreshTokenRepository = module.get<RefreshTokenRepository>(RefreshTokenRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(refreshTokenRepository).toBeDefined();
  });

  describe('find', () => {
    it('should return a refresh token if found', async () => {
      const refreshToken = 'some-refresh-token';
      const mockToken: ActiveRefreshToken = { userId: 1, refreshToken } as ActiveRefreshToken;
      mockPrismaService.activeRefreshToken.findUnique.mockResolvedValue(mockToken);

      const result = await refreshTokenRepository.find(refreshToken);
      expect(result).toEqual(mockToken);
      expect(mockPrismaService.activeRefreshToken.findUnique).toHaveBeenCalledWith({
        where: { refreshToken },
      });
    });

    it('should return null if refresh token not found', async () => {
      const refreshToken = 'non-existent-token';
      mockPrismaService.activeRefreshToken.findUnique.mockResolvedValue(null);

      const result = await refreshTokenRepository.find(refreshToken);
      expect(result).toBeNull();
      expect(mockPrismaService.activeRefreshToken.findUnique).toHaveBeenCalledWith({
        where: { refreshToken },
      });
    });
  });

  describe('create', () => {
    it('should create and return a new refresh token', async () => {
      const refreshToken = 'new-refresh-token';
      const userId = 1;
      const mockToken: ActiveRefreshToken = { userId: 1, refreshToken } as ActiveRefreshToken;
      mockPrismaService.activeRefreshToken.create.mockResolvedValue(mockToken);

      const result = await refreshTokenRepository.create(refreshToken, userId);
      expect(result).toEqual(mockToken);
      expect(mockPrismaService.activeRefreshToken.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          refreshToken,
        },
      });
    });
  });

  describe('findByUserId', () => {
    it('should return a refresh token if found by userId', async () => {
      const userId = 1;
      const mockToken: ActiveRefreshToken = { userId: 1, refreshToken: 'some-refresh-token' } as ActiveRefreshToken;
      mockPrismaService.activeRefreshToken.findUnique.mockResolvedValue(mockToken);

      const result = await refreshTokenRepository.findByUserId(userId);
      expect(result).toEqual(mockToken);
      expect(mockPrismaService.activeRefreshToken.findUnique).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
    });

    it('should return null if no refresh token found for userId', async () => {
      const userId = 1;
      mockPrismaService.activeRefreshToken.findUnique.mockResolvedValue(null);

      const result = await refreshTokenRepository.findByUserId(userId);
      expect(result).toBeNull();
      expect(mockPrismaService.activeRefreshToken.findUnique).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
    });
  });

  describe('updateByUserId', () => {
    it('should update the refresh token for the given userId', async () => {
      const userId = 1;
      const newToken = 'updated-refresh-token';
      await refreshTokenRepository.updateByUserId(userId, newToken);

      expect(mockPrismaService.activeRefreshToken.upsert).toHaveBeenCalledWith({
        where: { userId },
        create: {
          userId: userId,
          refreshToken: newToken,
        },
        update: {
          refreshToken: newToken,
        }
      });
    });
  });
});
