import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { GoogleUser } from './auth.types';

describe('AuthService', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let jwtService: JwtService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let refreshTokenService: RefreshTokenService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userService: UserService;
  let authService: AuthService;

  const mockUserService = {
    findUserByEmail: jest.fn(),
    createUser: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockRefreshTokenService = {
    encryptRefreshTokenAndSaveToDB: jest.fn(),
    getDecryptedRefreshTokenByUserId: jest.fn(),
    updateByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: RefreshTokenService,
          useValue: mockRefreshTokenService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    refreshTokenService = module.get<RefreshTokenService>(RefreshTokenService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('handleOAuth', () => {
    it('should create a new user and return tokens if user does not exist', async () => {
      const reqUser: GoogleUser = {
        email: 'test@example.com',
        name: 'Test User',
        accessToken: 'Access Token',
        picture: 'Picture',
      };
      const newUser = { id: 1, email: reqUser.email, name: reqUser.name };
      const refreshToken = 'new-refresh-token';
      const accessToken = 'access-token';

      mockUserService.findUserByEmail.mockResolvedValue(null); // Пользователь не найден
      mockUserService.createUser.mockResolvedValue(newUser); // Создаем нового пользователя
      mockJwtService.sign.mockImplementation(
        (payload, options: { expiresIn: string }) => {
          if (options?.expiresIn === '7d') return refreshToken;
          return accessToken;
        },
      );

      const result = await authService.handleOAuth(reqUser);

      expect(result).toEqual({
        accessToken,
        refreshToken,
        isNewUser: true,
      });
      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(
        reqUser.email,
      );
      expect(mockUserService.createUser).toHaveBeenCalledWith({
        email: reqUser.email,
        name: reqUser.name,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { id: newUser.id.toString() },
        { expiresIn: '7d' },
      );
      expect(
        mockRefreshTokenService.encryptRefreshTokenAndSaveToDB,
      ).toHaveBeenCalledWith(refreshToken, newUser.id);
    });

    it('should get stored refresh token for existing user', async () => {
      const reqUser: GoogleUser = {
        email: 'test@example.com',
        name: 'Test User',
        accessToken: 'Access Token',
        picture: 'Picture',
      };
      const user = { id: 1, email: reqUser.email, name: reqUser.name };
      const refreshToken = 'stored-refresh-token';
      const accessToken = 'access-token';

      mockUserService.findUserByEmail.mockResolvedValue(user);
      mockRefreshTokenService.getDecryptedRefreshTokenByUserId.mockResolvedValue(
        refreshToken,
      );
      mockJwtService.sign.mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (payload, options: { expiresIn: string }) => {
          return accessToken;
        },
      );

      const result = await authService.handleOAuth(reqUser);

      expect(result).toEqual({
        accessToken,
        refreshToken,
        isNewUser: false,
      });

      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(
        reqUser.email,
      );
      expect(
        mockRefreshTokenService.getDecryptedRefreshTokenByUserId,
      ).toHaveBeenCalledWith(user.id);

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          id: user.id.toString(),
        },
        { expiresIn: '1h' },
      );
    });

    it('should create and save new refresh token for existing user without one', async () => {
      const reqUser: GoogleUser = {
        email: 'test@example.com',
        name: 'Test User',
        accessToken: 'Access Token',
        picture: 'Picture',
      };
      const user = { id: 1, email: reqUser.email, name: reqUser.name };
      const refreshToken = 'new-refresh-token';
      const accessToken = 'access-token';

      mockUserService.findUserByEmail.mockResolvedValue(user);
      mockRefreshTokenService.getDecryptedRefreshTokenByUserId.mockResolvedValue(
        null,
      );
      mockJwtService.sign.mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (payload, options: { expiresIn: string }) => {
          if (options?.expiresIn === '7d') return refreshToken;
          return accessToken;
        },
      );
      mockRefreshTokenService.updateByUserId.mockResolvedValue(null);

      const result = await authService.handleOAuth(reqUser);

      expect(result).toEqual({
        accessToken,
        refreshToken,
        isNewUser: false,
      });

      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(
        reqUser.email,
      );

      expect(
        mockRefreshTokenService.getDecryptedRefreshTokenByUserId,
      ).toHaveBeenCalledWith(user.id);

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          id: user.id.toString(),
        },
        { expiresIn: '7d' },
      );

      expect(mockRefreshTokenService.updateByUserId).toHaveBeenCalledWith(
        user.id,
        refreshToken,
      );

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          id: user.id.toString(),
        },
        { expiresIn: '1h' },
      );
    });
  });
});
