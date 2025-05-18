import { Test, TestingModule } from '@nestjs/testing';
import { SpotifyRepository } from './spotify.repository';
import { PrismaService } from '../prisma.service';
import { SpotifyActiveRefreshToken } from '@prisma/client';

describe('SpotifyRepository', () => {
  let spotifyRepository: SpotifyRepository;
	//eslint-disable-next-line @typescript-eslint/no-unused-vars
  let prismaService: PrismaService;

  const mockPrismaService = {
    spotifyActiveRefreshToken: {
      findUnique: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpotifyRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    spotifyRepository = module.get<SpotifyRepository>(SpotifyRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(spotifyRepository).toBeDefined();
  });

  describe('find', () => {
    it('should return a refresh token if found', async () => {
      const refreshToken = 'some-refresh-token';
      const mockToken: SpotifyActiveRefreshToken = { userId: 1, refreshToken } as SpotifyActiveRefreshToken;
      mockPrismaService.spotifyActiveRefreshToken.findUnique.mockResolvedValue(mockToken);

      const result = await spotifyRepository.find(refreshToken);
      expect(result).toEqual(mockToken);
      expect(mockPrismaService.spotifyActiveRefreshToken.findUnique).toHaveBeenCalledWith({
        where: { refreshToken },
      });
    });

    it('should return null if refresh token not found', async () => {
      const refreshToken = 'non-existent-token';
      mockPrismaService.spotifyActiveRefreshToken.findUnique.mockResolvedValue(null);

      const result = await spotifyRepository.find(refreshToken);
      expect(result).toBeNull();
      expect(mockPrismaService.spotifyActiveRefreshToken.findUnique).toHaveBeenCalledWith({
        where: { refreshToken },
      });
    });
  });

  describe('deleteByUserId', () => {
    it('should delete a refresh token by userId', async () => {
      const userId = 1;

      await spotifyRepository.deleteByUserId(userId);

      expect(mockPrismaService.spotifyActiveRefreshToken.delete).toHaveBeenCalledWith({
        where: { userId },
      });
    });
  });

  describe('create', () => {
    it('should create and return a new refresh token', async () => {
      const refreshToken = 'new-refresh-token';
      const userId = 1;
      const mockToken: SpotifyActiveRefreshToken = { userId, refreshToken } as SpotifyActiveRefreshToken;
      mockPrismaService.spotifyActiveRefreshToken.create.mockResolvedValue(mockToken);

      const result = await spotifyRepository.create(refreshToken, userId);
      expect(result).toEqual(mockToken);
      expect(mockPrismaService.spotifyActiveRefreshToken.create).toHaveBeenCalledWith({
        data: {
          userId,
          refreshToken,
        },
      });
    });
  });

  describe('findByUserId', () => {
    it('should return a refresh token if found by userId', async () => {
      const userId = 1;
      const mockToken: SpotifyActiveRefreshToken = { userId, refreshToken: 'some-refresh-token' } as SpotifyActiveRefreshToken;
      mockPrismaService.spotifyActiveRefreshToken.findUnique.mockResolvedValue(mockToken);

      const result = await spotifyRepository.findByUserId(userId);
      expect(result).toEqual(mockToken);
      expect(mockPrismaService.spotifyActiveRefreshToken.findUnique).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it('should return null if no refresh token found for userId', async () => {
      const userId = 1;
      mockPrismaService.spotifyActiveRefreshToken.findUnique.mockResolvedValue(null);

      const result = await spotifyRepository.findByUserId(userId);
      expect(result).toBeNull();
      expect(mockPrismaService.spotifyActiveRefreshToken.findUnique).toHaveBeenCalledWith({
        where: { userId },
      });
    });
  });

  describe('updateByUserId', () => {
    it('should upsert a refresh token for the given userId', async () => {
      const userId = 1;
      const newToken = 'updated-refresh-token';

      await spotifyRepository.updateByUserId(userId, newToken);

      expect(mockPrismaService.spotifyActiveRefreshToken.upsert).toHaveBeenCalledWith({
        where: { userId },
        update: {
          refreshToken: newToken,
        },
        create: {
          userId,
          refreshToken: newToken,
        },
      });
    });
  });
});