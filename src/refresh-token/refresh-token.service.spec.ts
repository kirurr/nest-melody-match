import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshTokenRepository } from './refresh-token.repository';
import { CryptoService } from './crypto-service';

describe('RefreshTokenService', () => {
  let refreshTokenService: RefreshTokenService;
  //eslint-disable-next-line
  let refreshTokenRepository: RefreshTokenRepository;
  //eslint-disable-next-line
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
      const encryptedToken = 'encrypted-refresh-token';
      mockCryptoService.encryptRefreshToken.mockReturnValue(encryptedToken);

      await refreshTokenService.updateByUserId(userId, newToken);

      expect(mockCryptoService.encryptRefreshToken).toHaveBeenCalledWith(newToken);
      expect(mockRefreshTokenRepository.updateByUserId).toHaveBeenCalledWith(userId, encryptedToken);
    });
  });

  describe('checkRefreshToken', () => {
    it('should return false if no refresh token is found in the database', async () => {
      const userId = 1;
      const refreshToken = 'some-refresh-token';

      mockRefreshTokenRepository.findByUserId.mockResolvedValue(null);

      const result = await refreshTokenService.checkRefreshToken(refreshToken, userId);
      expect(result).toBe(false);
      expect(mockRefreshTokenRepository.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('should return true if the decrypted refresh token matches', async () => {
      const userId = 1;
      const refreshToken = 'some-refresh-token';
      const mockStoredToken = { refreshToken: 'encrypted-refresh-token' };

      mockRefreshTokenRepository.findByUserId.mockResolvedValue(mockStoredToken);
      mockCryptoService.decryptRefreshToken.mockResolvedValue(refreshToken);

      const result = await refreshTokenService.checkRefreshToken(refreshToken, userId);
      expect(result).toBe(true);
      expect(mockRefreshTokenRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockCryptoService.decryptRefreshToken).toHaveBeenCalledWith(mockStoredToken.refreshToken);
    });

    it('should return false if the decrypted refresh token does not match', async () => {
      const userId = 1;
      const refreshToken = 'some-refresh-token';
      const mockStoredToken = { refreshToken: 'encrypted-refresh-token' };

      mockRefreshTokenRepository.findByUserId.mockResolvedValue(mockStoredToken);
      mockCryptoService.decryptRefreshToken.mockResolvedValue('different-refresh-token');

      const result = await refreshTokenService.checkRefreshToken(refreshToken, userId);
      expect(result).toBe(false);
      expect(mockRefreshTokenRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockCryptoService.decryptRefreshToken).toHaveBeenCalledWith(mockStoredToken.refreshToken);
    });
  });
});
