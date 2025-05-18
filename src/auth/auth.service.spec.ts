import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { UserService } from '../user/user.service';
import { SpotifyService } from '../spotify/spotify.service';
import { User } from '@prisma/client';

describe('AuthService', () => {
  let authService: AuthService;
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  let jwtService: JwtService;
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  let refreshTokenService: RefreshTokenService;
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userService: UserService;
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  let spotifyService: SpotifyService;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockRefreshTokenService = {
    checkRefreshToken: jest.fn(),
    updateByUserId: jest.fn(),
    encryptRefreshTokenAndSaveToDB: jest.fn(),
    getDecryptedRefreshTokenByUserId: jest.fn(),
  };

  const mockUserService = {
    findUserByEmail: jest.fn(),
    createUser: jest.fn(),
  };

  const mockSpotifyService = {
    encryptRefreshTokenAndSaveToDB: jest.fn(),
    updateByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: RefreshTokenService, useValue: mockRefreshTokenService },
        { provide: UserService, useValue: mockUserService },
        { provide: SpotifyService, useValue: mockSpotifyService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    refreshTokenService = module.get<RefreshTokenService>(RefreshTokenService);
    userService = module.get<UserService>(UserService);
    spotifyService = module.get<SpotifyService>(SpotifyService);
  });

  describe('handleOAuth', () => {
    it('should create a new user and return tokens if user does not exist', async () => {
      const reqUser = { email: 'test@example.com', name: 'Test User' };
      const newUser: User = { id: 1, email: reqUser.email, name: reqUser.name } as User;
      const refreshToken = 'new-refresh-token';
      const accessToken = 'access-token';

      mockUserService.findUserByEmail.mockResolvedValue(null); // Пользователь не найден
      mockUserService.createUser.mockResolvedValue(newUser); // Создаем нового пользователя
      mockJwtService.sign.mockImplementation((payload, options: {expiresIn: string}) => {
        if (options?.expiresIn === '7d') return refreshToken;
        return accessToken;
      });

      const result = await authService.handleOAuth(reqUser);

      expect(result).toEqual({ accessToken, refreshToken, isNewUser: true, user: newUser });
      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(reqUser.email);
      expect(mockUserService.createUser).toHaveBeenCalledWith({ email: reqUser.email, name: reqUser.name });
      expect(mockJwtService.sign).toHaveBeenCalledWith({ id: newUser.id.toString() }, { expiresIn: '7d' });
      expect(mockRefreshTokenService.encryptRefreshTokenAndSaveToDB).toHaveBeenCalledWith(refreshToken, newUser.id);
    });

    it('should return existing user and refresh token if user exists', async () => {
      const reqUser = { email: 'test@example.com', name: 'Test User' };
      const existingUser: User = { id: 1, email: reqUser.email, name: reqUser.name } as User;
      const refreshToken = 'existing-refresh-token';
      const accessToken = 'access-token';

      mockUserService.findUserByEmail.mockResolvedValue(existingUser); // Пользователь найден
      mockRefreshTokenService.getDecryptedRefreshTokenByUserId.mockResolvedValue(refreshToken); // Возвращаем существующий токен
      mockJwtService.sign.mockReturnValue(accessToken); // Возвращаем токен доступа

      const result = await authService.handleOAuth(reqUser);

      expect(result).toEqual({ accessToken, refreshToken, isNewUser: false, user: existingUser });
      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(reqUser.email);
      expect(mockRefreshTokenService.getDecryptedRefreshTokenByUserId).toHaveBeenCalledWith(existingUser.id);
      expect(mockJwtService.sign).toHaveBeenCalledWith({ id: existingUser.id.toString() }, { expiresIn: '1h' });
    });

    it('should create a new refresh token if existing one is invalid', async () => {
      const reqUser = { email: 'test@example.com', name: 'Test User' };
      const existingUser: User = { id: 1, email: reqUser.email, name: reqUser.name } as User;
      const newRefreshToken = 'new-refresh-token';
      const accessToken = 'access-token';

      mockUserService.findUserByEmail.mockResolvedValue(existingUser); // Пользователь найден
      mockRefreshTokenService.getDecryptedRefreshTokenByUserId.mockResolvedValue(null); // Существующий токен недействителен
      mockJwtService.sign.mockImplementation((payload, options: {expiresIn?: string}) => {
        if (options?.expiresIn === '7d') return newRefreshToken;
        return accessToken;
      });

      const result = await authService.handleOAuth(reqUser);

      expect(result).toEqual({ accessToken, refreshToken: newRefreshToken, isNewUser: false, user: existingUser });
      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(reqUser.email);
      expect(mockRefreshTokenService.getDecryptedRefreshTokenByUserId).toHaveBeenCalledWith(existingUser.id);
      expect(mockJwtService.sign).toHaveBeenCalledWith({ id: existingUser.id.toString() }, { expiresIn: '7d' });
      expect(mockRefreshTokenService.updateByUserId).toHaveBeenCalledWith(existingUser.id, newRefreshToken);
    });
  });

  describe('handleRefreshToken', () => {
    it('should return new access and refresh tokens if the refresh token is valid', async () => {
      const refreshToken = 'valid-refresh-token';
      const userId = 1;
      const newAccessToken = 'new-access-token';
      const newRefreshToken = 'new-refresh-token';

      mockJwtService.verify.mockReturnValue({ id: userId });
      mockRefreshTokenService.checkRefreshToken.mockResolvedValue(true);
      mockJwtService.sign.mockImplementation((payload, options: {expiresIn?: string}) => {
        if (options?.expiresIn === '7d') return newRefreshToken;
        return newAccessToken;
      });

      const result = await authService.hanleRefreshToken(refreshToken);

      expect(result).toEqual({ accessToken: newAccessToken, refreshToken: newRefreshToken });
      expect(mockRefreshTokenService.updateByUserId).toHaveBeenCalledWith(userId, newRefreshToken);
    });

    it('should return null if the refresh token is invalid', async () => {
      const refreshToken = 'invalid-refresh-token';

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await authService.hanleRefreshToken(refreshToken);

      expect(result).toBeNull();
    });
  });
});