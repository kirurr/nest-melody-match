import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from './jwt.service';
import { JwtService as JwtNestService } from '@nestjs/jwt';

describe('JwtService', () => {
  let service: JwtService;
  let jwtService: JwtNestService;

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: JwtNestService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<JwtService>(JwtService);
    jwtService = module.get<JwtNestService>(JwtNestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signAccessToken', () => {
    it('should call signAsync with correct params', async () => {
      const userId = 1;
      const token = 'access-token';
      mockJwtService.signAsync.mockResolvedValue(token);

      const result = await service.signAccessToken(userId);
      expect(result).toBe(token);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { userId },
        { expiresIn: '1h' },
      );
    });
  });

  describe('signRefreshToken', () => {
    it('should call signAsync with correct params', async () => {
      const userId = 1;
      const token = 'refresh-token';
      mockJwtService.signAsync.mockResolvedValue(token);

      const result = await service.signRefreshToken(userId);
      expect(result).toBe(token);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { userId },
        { expiresIn: '30d' },
      );
    });
  });

  describe('verifyAccessToken', () => {
    it('should successfully verify an access token', async () => {
      const accessToken = 'access-token';
      const userId = 1;
      mockJwtService.verifyAsync.mockResolvedValue({ userId });

      const result = await service.verifyAccessToken(accessToken);
      expect(result).toEqual({ userId });
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(accessToken);
    });

    it('should throw an error if the access token is invalid', async () => {
      const invalidToken = 'invalid-token';
      const errorMessage = 'Invalid token';

      mockJwtService.verifyAsync.mockRejectedValue(new Error(errorMessage));

      await expect(service.verifyAccessToken(invalidToken)).rejects.toThrow(
        new Error(errorMessage),
      );
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(invalidToken);
    });

    it('should throw an error if the access token is expired', async () => {
      const expiredToken = 'expired-token';
      const errorMessage = 'Token expired';

      mockJwtService.verifyAsync.mockRejectedValue(new Error(errorMessage));

      await expect(service.verifyAccessToken(expiredToken)).rejects.toThrow(
        new Error(errorMessage),
      );
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(expiredToken);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a refresh token', async () => {
      const refreshToken = 'refresh-token';
      const userId = 1;
      mockJwtService.verifyAsync.mockResolvedValue({ userId });

      const result = await service.verifyRefreshToken(refreshToken);
      expect(result).toEqual({ userId });
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(refreshToken);
    });

    it('should throw an error if the refresh token is invalid', async () => {
      const invalidToken = 'invalid-token';
      const errorMessage = 'Invalid token';

      mockJwtService.verifyAsync.mockRejectedValue(new Error(errorMessage));

      await expect(service.verifyRefreshToken(invalidToken)).rejects.toThrow(
        new Error(errorMessage),
      );
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(invalidToken);
    });

    it('should throw an error if the refresh token is expired', async () => {
      const expiredToken = 'expired-token';
      const errorMessage = 'Token expired';

      mockJwtService.verifyAsync.mockRejectedValue(new Error(errorMessage));

      await expect(service.verifyRefreshToken(expiredToken)).rejects.toThrow(
        new Error(errorMessage),
      );
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(expiredToken);
    });
  });
});
