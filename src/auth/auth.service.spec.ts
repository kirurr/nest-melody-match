import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { GoogleAuthService } from './google-auth/google-auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '../jwt/jwt.service';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { User } from '@prisma/client';

describe('AuthService', () => {
  let authService: AuthService;
  let googleAuthService: GoogleAuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let refreshTokenService: RefreshTokenService;

  const mockGoogleAuthService = {
    retireveTokensAndUserData: jest.fn(),
  };

  const mockUserService = {
    findUserByEmail: jest.fn(),
    createUser: jest.fn(),
  };

  const mockJwtService = {
    signAccessToken: jest.fn(),
    signRefreshToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
  };

  const mockRefreshTokenService = {
    encryptRefreshTokenAndSaveToDB: jest.fn(),
    getDecryptedRefreshTokenByUserId: jest.fn(),
    updateByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: GoogleAuthService, useValue: mockGoogleAuthService },
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: RefreshTokenService, useValue: mockRefreshTokenService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    googleAuthService = module.get<GoogleAuthService>(GoogleAuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    refreshTokenService = module.get<RefreshTokenService>(RefreshTokenService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('googleAuth', () => {
    it('should successfully handle google auth', async () => {
      const userData = { email: 'test@example.com', name: 'Google User' };
      const googleTokens = {
        access_token: 'token',
        expires_in: 222222222,
        refresh_token: 'token',
        scope: 'scope',
        token_type: 'type',
      };
      const code = 'code';
      const tokens = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };

      mockGoogleAuthService.retireveTokensAndUserData.mockResolvedValue([
        googleTokens,
        userData,
      ]);
      const handleAuthMock = jest
        .spyOn(authService, 'handleAuth')
        .mockResolvedValue(tokens);

      const result = await authService.googleAuth(code);

      expect(
        mockGoogleAuthService.retireveTokensAndUserData,
      ).toHaveBeenCalledWith(code);
			expect(handleAuthMock).toHaveBeenCalledWith(userData);

      expect(result).toEqual(tokens);
    });
  });

  describe('handleAuth', () => {
    it('should successfully handle auth with existing user and valid refresh token', async () => {
      const userData = { email: 'test@example.com', name: 'Test User' };
      const user: User = {
        name: 'Test User',
        email: 'test@example.com',
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const refreshToken = 'valid-refresh-token';
      const accessToken = 'new-access-token';

      mockUserService.findUserByEmail.mockResolvedValue(user);
      mockRefreshTokenService.getDecryptedRefreshTokenByUserId.mockResolvedValue(
        refreshToken,
      );
      mockJwtService.signAccessToken.mockResolvedValue(accessToken);

      const result = await authService.handleAuth(userData);

      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(userData.email);
      expect(
        mockRefreshTokenService.getDecryptedRefreshTokenByUserId,
      ).toHaveBeenCalledWith(user.id);
      expect(mockJwtService.verifyRefreshToken).toHaveBeenCalledWith(
        refreshToken,
      );
      expect(mockJwtService.signAccessToken).toHaveBeenCalledWith(user.id);

      expect(result).toEqual({ accessToken, refreshToken });
    });

    it('should successfully handle auth with existing user and invalid refresh token', async () => {
      const userData = { email: 'test@example.com', name: 'Test User' };
      const user: User = {
        name: 'Test User',
        email: 'test@example.com',
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const refreshToken = 'invalid-refresh-token';
      const newRefreshToken = 'new-refresh-token';
      const accessToken = 'new-access-token';

      mockUserService.findUserByEmail.mockResolvedValue(user);
      mockRefreshTokenService.getDecryptedRefreshTokenByUserId.mockResolvedValue(
        refreshToken,
      );
      mockJwtService.verifyRefreshToken.mockRejectedValue(
        new Error('Token expired'),
      );
      mockJwtService.signRefreshToken.mockResolvedValue(newRefreshToken);

      mockJwtService.signAccessToken.mockResolvedValue(accessToken);

      const result = await authService.handleAuth(userData);

      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(userData.email);
      expect(
        mockRefreshTokenService.getDecryptedRefreshTokenByUserId,
      ).toHaveBeenCalledWith(user.id);
      expect(mockJwtService.verifyRefreshToken).toHaveBeenCalledWith(
        refreshToken,
      );
      expect(mockJwtService.signRefreshToken).toHaveBeenCalledWith(user.id);
      expect(mockRefreshTokenService.updateByUserId).toHaveBeenCalledWith(
        user.id,
        newRefreshToken,
      );

      expect(mockJwtService.signAccessToken).toHaveBeenCalledWith(user.id);

      expect(result).toEqual({ accessToken, refreshToken: newRefreshToken });
    });

    it('should successfully handle auth with existing user without refresh token', async () => {
      const userData = { email: 'test@example.com', name: 'Test User' };
      const user: User = {
        name: 'Test User',
        email: 'test@example.com',
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const refreshToken = 'new-refresh-token';
      const accessToken = 'new-access-token';

      mockUserService.findUserByEmail.mockResolvedValue(user);
      mockRefreshTokenService.getDecryptedRefreshTokenByUserId.mockResolvedValue(
        null,
      );
      mockJwtService.signRefreshToken.mockResolvedValue(refreshToken);
      mockJwtService.signAccessToken.mockResolvedValue(accessToken);

      const result = await authService.handleAuth(userData);

      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(userData.email);
      expect(
        mockRefreshTokenService.getDecryptedRefreshTokenByUserId,
      ).toHaveBeenCalledWith(user.id);
      expect(mockJwtService.signRefreshToken).toHaveBeenCalledWith(user.id);
      expect(
        mockRefreshTokenService.encryptRefreshTokenAndSaveToDB,
      ).toHaveBeenCalledWith(refreshToken, user.id);
      expect(mockJwtService.signAccessToken).toHaveBeenCalledWith(user.id);

      expect(result).toEqual({ accessToken, refreshToken });
    });

    it('should successfully handle auth without existing user', async () => {
      const userData = { email: 'test@example.com', name: 'New User' };
      const user: User = {
        name: 'New User',
        email: 'test@example.com',
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const refreshToken = 'new-refresh-token';
      const accessToken = 'new-access-token';

      mockUserService.findUserByEmail.mockResolvedValue(null);
      mockUserService.createUser.mockResolvedValue(user);
      mockJwtService.signRefreshToken.mockResolvedValue(refreshToken);
      mockJwtService.signAccessToken();

      const result = await authService.handleAuth(userData);

      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockUserService.createUser).toHaveBeenCalledWith(userData);
      expect(mockJwtService.signRefreshToken).toHaveBeenCalledWith(user.id);
      expect(
        mockRefreshTokenService.encryptRefreshTokenAndSaveToDB,
      ).toHaveBeenCalledWith(refreshToken, user.id);
      expect(mockJwtService.signAccessToken).toHaveBeenCalledWith(user.id);

      expect(result).toEqual({ accessToken, refreshToken });
    });
  });
});
