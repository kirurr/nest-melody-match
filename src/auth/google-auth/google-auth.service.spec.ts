import { Test, TestingModule } from '@nestjs/testing';
import { GoogleAuthService } from './google-auth.service';
import {
  GoogleAuthProvider,
  GoogleTokens,
  GoogleUserData,
} from './google-auth.provider';

describe('GoogleAuthService', () => {
  let googleAuthService: GoogleAuthService;
  let googleAuthProvider: GoogleAuthProvider;

  const mockGoogleAuthProvider = {
    getAuthTokens: jest.fn(),
    getUserData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleAuthService,
        {
          provide: GoogleAuthProvider,
          useValue: mockGoogleAuthProvider,
        },
      ],
    }).compile();

    googleAuthService = module.get<GoogleAuthService>(GoogleAuthService);
    googleAuthProvider = module.get<GoogleAuthProvider>(GoogleAuthProvider);
  });

  it('should be defined', () => {
    expect(googleAuthService).toBeDefined();
  });

  describe('retireveTokensAndUserData', () => {
    it('should retrieve tokens and user data', async () => {
      const authCode = 'auth-code';
      const mockTokens: GoogleTokens = {
        access_token: 'access-token',
        expires_in: 3600,
        refresh_token: 'refresh-token',
        scope: 'email',
        token_type: 'Bearer',
      };
      const mockUserData: GoogleUserData = {
        id: 'user-id',
        email: 'test@example.com',
        verified_email: true,
        name: 'Test User',
        given_name: 'Test',
        picture: 'http://example.com/picture.jpg',
      };

      mockGoogleAuthProvider.getAuthTokens.mockResolvedValue(mockTokens);
      mockGoogleAuthProvider.getUserData.mockResolvedValue(mockUserData);

      const result =
        await googleAuthService.retireveTokensAndUserData(authCode);

      expect(result).toEqual([mockTokens, mockUserData]);
      expect(mockGoogleAuthProvider.getAuthTokens).toHaveBeenCalledWith(
        authCode,
      );
      expect(mockGoogleAuthProvider.getUserData).toHaveBeenCalledWith(
        mockTokens.access_token,
      );
    });
  });
});
