import { Test, TestingModule } from '@nestjs/testing';
import {
  GoogleAuthProvider,
  GoogleTokens,
  GoogleUserData,
} from './google-auth.provider';
import { ConfigService } from '@nestjs/config';

global.fetch = jest.fn(); // Мокаем глобальную функцию fetch

describe('GoogleAuthProvider', () => {
  let googleAuthProvider: GoogleAuthProvider;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'GOOGLE_CLIENT_ID':
          return 'client-id';
        case 'GOOGLE_CLIENT_SECRET':
          return 'client-secret';
        case 'GOOGLE_REDIRECT_URI':
          return 'redirect-uri';
        default:
          return null;
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleAuthProvider,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    googleAuthProvider = module.get<GoogleAuthProvider>(GoogleAuthProvider);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(googleAuthProvider).toBeDefined();
  });

  describe('getAuthTokens', () => {
    it('should return Google tokens', async () => {
      const code = 'auth-code';
      const mockTokens: GoogleTokens = {
        access_token: 'access-token',
        expires_in: 3600,
        refresh_token: 'refresh-token',
        scope: 'email',
        token_type: 'Bearer',
      };

      (fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockTokens),
      });

      const tokens = await googleAuthProvider.getAuthTokens(code);

      expect(tokens).toEqual(mockTokens);
      expect(fetch).toHaveBeenCalledWith(
        'https://oauth2.googleapis.com/token?code=auth-code&client_id=client-id&client_secret=client-secret&redirect_uri=redirect-uri&grant_type=authorization_code',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
    });
  });

  describe('getUserData', () => {
    it('should return user data', async () => {
      const accessToken = 'access-token';
      const mockUserData: GoogleUserData = {
        id: 'user-id',
        email: 'test@example.com',
        verified_email: true,
        name: 'Test User',
        given_name: 'Test',
        picture: 'http://example.com/picture.jpg',
      };

      (fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockUserData),
      });

      const userData = await googleAuthProvider.getUserData(accessToken);

      expect(userData).toEqual(mockUserData);
      expect(fetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/userinfo/v2/me',
        {
          headers: {
            Authorization: 'Bearer ' + accessToken,
          },
        },
      );
    });
  });
});
