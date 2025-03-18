import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshTokenRepository } from './refresh-token.repository';
import { CryptoService } from './crypto-service';

describe('RefreshTokenService', () => {
  let refreshTokenService: RefreshTokenService;
  let refreshTokenRepository: RefreshTokenRepository;
  let cryptoService: CryptoService;

  const mockRefreshTokenRepository = {
    create: jest.fn(),
    findByUserId: jest.fn(),
    updateByUserId: jest.fn(),
  };

  const mockCryptoService = {
    encryptRefreshToken: jest.fn(),
    decryptRefreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        {
          provide: RefreshTokenRepository,
          useValue: mockRefreshTokenRepository,
        },
        {
          provide: CryptoService,
          useValue: mockCryptoService,
        },
      ],
    }).compile();

    refreshTokenService = module.get<RefreshTokenService>(RefreshTokenService);
    refreshTokenRepository = module.get<RefreshTokenRepository>(RefreshTokenRepository);
    cryptoService = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(refreshTokenService).toBeDefined();
  });

  describe('encryptRefreshTokenAndSaveToDB', () => {
    it('should encrypt the refresh token and save it to the database', async () => {
      const refreshToken = 'my-refresh-token';
      const userId = 1;
      const encryptedToken = 'encrypted-token';

      mockCryptoService.encryptRefreshToken.mockResolvedValue(encryptedToken);
      mockRefreshTokenRepository.create.mockResolvedValue(undefined);

      const result = await refreshTokenService.encryptRefreshTokenAndSaveToDB(refreshToken, userId);

      expect(result).toBe(encryptedToken);
      expect(mockCryptoService.encryptRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockRefreshTokenRepository.create).toHaveBeenCalledWith(encryptedToken, userId);
    });
  });

  describe('getDecryptedRefreshTokenByUserId', () => {
    it('should return null if no refresh token is found for the user', async () => {
      const userId = 1;
      mockRefreshTokenRepository.findByUserId.mockResolvedValue(null);

      const result = await refreshTokenService.getDecryptedRefreshTokenByUserId(userId);
      expect(result).toBeNull();
      expect(mockRefreshTokenRepository.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('should return the decrypted refresh token if found', async () => {
      const userId = 1;
      const mockToken = { refreshToken: 'encrypted-token' };
      const decryptedToken = 'my-refresh-token';

      mockRefreshTokenRepository.findByUserId.mockResolvedValue(mockToken);
      mockCryptoService.decryptRefreshToken.mockResolvedValue(decryptedToken);

      const result = await refreshTokenService.getDecryptedRefreshTokenByUserId(userId);
      expect(result).toBe(decryptedToken);
      expect(mockRefreshTokenRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockCryptoService.decryptRefreshToken).toHaveBeenCalledWith(mockToken.refreshToken);
    });
  });

  describe('updateByUserId', () => {
    it('should update the refresh token for the given userId', async () => {
      const userId = 1;
      const newToken = 'updated-refresh-token';

      await refreshTokenService.updateByUserId(userId, newToken);

      expect(mockRefreshTokenRepository.updateByUserId).toHaveBeenCalledWith(userId, newToken);
    });
  });
});
