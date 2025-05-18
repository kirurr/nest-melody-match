import { Test, TestingModule } from '@nestjs/testing';
import { SpotifyService } from './spotify.service';
import { SpotifyRepository } from './spotify.repository';
import { CryptoService } from '../refresh-token/crypto-service';
import { ConfigService } from '@nestjs/config';
import { GenreService } from '../genre/genre.service';
import { UserService } from '../user/user.service';
import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

global.fetch = jest.fn();

describe('SpotifyService', () => {
  let spotifyService: SpotifyService;
	//eslint-disable-next-line @typescript-eslint/no-unused-vars
  let spotifyRepository: SpotifyRepository;
	//eslint-disable-next-line @typescript-eslint/no-unused-vars
  let cryptoService: CryptoService;
	//eslint-disable-next-line @typescript-eslint/no-unused-vars
  let configService: ConfigService;
	//eslint-disable-next-line @typescript-eslint/no-unused-vars
  let genreService: GenreService;
	//eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userService: UserService;

  const mockSpotifyRepository = {
    findByUserId: jest.fn(),
    create: jest.fn(),
    deleteByUserId: jest.fn(),
    updateByUserId: jest.fn(),
  };

  const mockCryptoService = {
    encryptRefreshToken: jest.fn(),
    decryptRefreshToken: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockGenreService = {
    findGenresByNames: jest.fn(),
    calculateUserGenreVector: jest.fn(),
  };

  const mockUserService = {
    updateUserPreferences: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpotifyService,
        {
          provide: SpotifyRepository,
          useValue: mockSpotifyRepository,
        },
        {
          provide: CryptoService,
          useValue: mockCryptoService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: GenreService,
          useValue: mockGenreService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    spotifyService = module.get<SpotifyService>(SpotifyService);
    spotifyRepository = module.get<SpotifyRepository>(SpotifyRepository);
    cryptoService = module.get<CryptoService>(CryptoService);
    configService = module.get<ConfigService>(ConfigService);
    genreService = module.get<GenreService>(GenreService);
    userService = module.get<UserService>(UserService);
  });

  describe('asignSpotifyGenresToUser', () => {
    it('should assign Spotify genres to user and create new access token if needed', async () => {
      const userId = 1;
      const refreshToken = 'some-refresh-token';
      const accessToken = 'valid-access-token';
      const genresNames = ['Pop', 'Rock'];
      const genres = [
        { id: 1, name: 'Pop' },
        { id: 2, name: 'Rock' },
      ];
      const vector = [1, 0, 0, 0, 0];
      const validSpotifyTokenResponse = {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: refreshToken,
        scope: 'user-read-email',
      };

      mockSpotifyRepository.findByUserId.mockResolvedValue({ refreshToken });
      mockSpotifyRepository.updateByUserId.mockResolvedValue(null);
      mockCryptoService.decryptRefreshToken.mockResolvedValue(accessToken);
      mockGenreService.findGenresByNames.mockResolvedValue(genres);
      mockGenreService.calculateUserGenreVector.mockResolvedValue(vector);
      mockUserService.updateUserPreferences.mockResolvedValue(undefined);

      (fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: jest.fn().mockResolvedValue(validSpotifyTokenResponse),
      });
      // Мокаем fetch для успешного ответа
      (fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: jest.fn().mockResolvedValue({ items: [{ genres: genresNames }] }),
      });

      await spotifyService.asignSpotifyGenresToUser(userId);

      expect(mockSpotifyRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockCryptoService.decryptRefreshToken).toHaveBeenCalledWith(
        refreshToken,
      );
      expect(mockGenreService.findGenresByNames).toHaveBeenCalledWith(
        genresNames,
      );
      expect(mockGenreService.calculateUserGenreVector).toHaveBeenCalledWith(
        genres.map((genre) => genre.id),
      );
      expect(mockUserService.updateUserPreferences).toHaveBeenCalledWith({
        userId,
        genresIds: genres.map((genre) => genre.id),
        genresVector: vector,
      });
    });
  });

  it('should throw UnauthorizedException if refresh token is invalid', async () => {
    const userId = 1;

    mockSpotifyRepository.findByUserId.mockResolvedValue(null);

    await expect(
      spotifyService.asignSpotifyGenresToUser(userId),
    ).rejects.toThrow(new UnauthorizedException('Refresh token is invalid'));
  });

  it('should throw InternalServerErrorException if fetch fails', async () => {
    const userId = 1;
    const refreshToken = 'some-refresh-token';
    const accessToken = 'valid-access-token';
    const validSpotifyTokenResponse = {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: refreshToken,
      scope: 'user-read-email',
    };

    mockSpotifyRepository.findByUserId.mockResolvedValue({ refreshToken });
    mockCryptoService.decryptRefreshToken.mockResolvedValue(refreshToken);
    mockConfigService.get.mockImplementation((key) => {
      switch (key) {
        case 'SPOTIFY_CLIENT_ID':
          return 'client-id';
        case 'SPOTIFY_CLIENT_SECRET':
          return 'client-secret';
        default:
          return null;
      }
    });

    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: jest.fn().mockResolvedValue(validSpotifyTokenResponse),
    });
    // Мокаем fetch для ошибки
    (fetch as jest.Mock).mockRejectedValue(new Error('Fetch error'));

    await expect(
      spotifyService.asignSpotifyGenresToUser(userId),
    ).rejects.toThrow(
      new InternalServerErrorException(
        'Something went wrong when trying to access Spotify, try to sign in again',
      ),
    );
  });

  describe('getNewSpotifyAccessToken', () => {
    it('should return new access token', async () => {
      const userId = 1;
      const refreshToken = 'some-refresh-token';
      const newAccessToken = 'new-access-token';

      const validSpotifyTokenResponse = {
        access_token: newAccessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: refreshToken,
        scope: 'user-read-email',
      };
      mockCryptoService.encryptRefreshToken.mockResolvedValue(refreshToken);
      mockSpotifyRepository.findByUserId.mockResolvedValue({ refreshToken });
      mockConfigService.get.mockImplementation((key) => {
        switch (key) {
          case 'SPOTIFY_CLIENT_ID':
            return 'client-id';
          case 'SPOTIFY_CLIENT_SECRET':
            return 'client-secret';
          default:
            return null;
        }
      });

      (fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: jest.fn().mockResolvedValue(validSpotifyTokenResponse),
      });

      const result = await spotifyService.getNewSpotifyAccessToken(
        userId,
        refreshToken,
      );

      expect(result).toEqual(newAccessToken);
    });

    it('should throw UnauthorizedException if response is not 200', async () => {
      const userId = 1;
      const refreshToken = 'some-refresh-token';

      mockSpotifyRepository.findByUserId.mockResolvedValue({ refreshToken });
      mockConfigService.get.mockImplementation((key) => {
        switch (key) {
          case 'SPOTIFY_CLIENT_ID':
            return 'client-id';
          case 'SPOTIFY_CLIENT_SECRET':
            return 'client-secret';
          default:
            return null;
        }
      });

      (fetch as jest.Mock).mockResolvedValueOnce({
        status: 400
      });

      await expect(
        spotifyService.getNewSpotifyAccessToken(userId, refreshToken),
      ).rejects.toThrow(
        new UnauthorizedException(
          'Recieved invalid response code from Spotify',
        ),
      );
    });
  });
});
