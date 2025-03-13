import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CryptoService } from './crypto-service';

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

jest.mock('crypto', () => ({
  createCipheriv: jest.fn(),
  createDecipheriv: jest.fn(),
  randomBytes: jest.fn(),
}));

describe('CryptoService', () => {
  let cryptoService: CryptoService;

  const mockConfigService: Partial<ConfigService> = {
    get: jest.fn(),
  };

  const secretKey = '0123456789abcdef0123456789abcdef'; // 32 байта в hex
  const token = 'my-refresh-token';
  const iv = '1234567890abcdef'; // Пример IV в hex
  const encryptedToken = 'encrypted-token';

  beforeEach(async () => {
    mockConfigService.get = jest.fn().mockReturnValue(secretKey);

		(randomBytes as jest.Mock).mockReturnValue(Buffer.from(iv, 'hex'));
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    cryptoService = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(cryptoService).toBeDefined();
  });

  it('should throw an error if REFRESH_SECRET is not set', () => {
    mockConfigService.get = jest.fn().mockReturnValue(undefined);
    expect(() => new CryptoService(mockConfigService as ConfigService)).toThrow(
      'REFRESH_SECRET env variable is not set',
    );
  });

  describe('encryptRefreshToken', () => {
    it('should encrypt the token', async () => {
      const mockCipher = {
        update: jest.fn().mockReturnValue(encryptedToken),
        final: jest.fn().mockReturnValue(''),
      };
      (createCipheriv as jest.Mock).mockReturnValue(mockCipher);
      (randomBytes as jest.Mock).mockReturnValue(Buffer.from(iv, 'hex'));

      const result = await cryptoService.encryptRefreshToken(token);
      expect(result).toBe(`${iv}:${encryptedToken}`);
      expect(createCipheriv).toHaveBeenCalledWith(
        cryptoService['algorithm'],
        cryptoService['secretKey'],
        expect.any(Buffer),
      );
      expect(mockCipher.update).toHaveBeenCalledWith(token, 'utf8', 'hex');
      expect(mockCipher.final).toHaveBeenCalledWith('hex');
    });
  });

  describe('decryptRefreshToken', () => {
    it('should decrypt the token', async () => {
      const mockDecipher = {
        update: jest.fn().mockReturnValue(token),
        final: jest.fn().mockReturnValue(''),
      };
      (createDecipheriv as jest.Mock).mockReturnValue(mockDecipher);

      const result = await cryptoService.decryptRefreshToken(`${iv}:${encryptedToken}`);
      expect(result).toBe(token);
      expect(createDecipheriv).toHaveBeenCalledWith(
        cryptoService['algorithm'],
        cryptoService['secretKey'],
        Buffer.from(iv, 'hex'),
      );
      expect(mockDecipher.update).toHaveBeenCalledWith(encryptedToken, 'hex', 'utf8');
      expect(mockDecipher.final).toHaveBeenCalledWith('utf8');
    });
  });
});
