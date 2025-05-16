import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { SpotifyRepository } from './spotify.repository';
import { CryptoService } from '../refresh-token/crypto-service';
import { ConfigService } from '@nestjs/config';
import {
  SpotifyRefreshTokenResponse,
  SpotifyUserTopArtistsResponse,
} from './spotify.types';
import { checkSpotifyRefreshTokenJSON } from './spotify.utils';
import { GenreService } from 'src/genre/genre.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SpotifyService {
  constructor(
    private readonly repository: SpotifyRepository,
    private readonly cryptoService: CryptoService,
    private readonly configService: ConfigService,
    private readonly genreService: GenreService,
    private readonly userService: UserService,
  ) {}

  private async tryFetchSpotifyUserTopArtists(
    access_token: string,
    limit: number = 10,
  ): Promise<Response | null> {
    const payload: RequestInit = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    };

    const url = `https://api.spotify.com/v1/me/top/artists?&limit=${limit}`;

    const response = await fetch(url, payload).catch(() => {
      throw new InternalServerErrorException(
        'Something went wrong when trying to access Spotify, try to sign in again',
      );
    });
    if (response.status === 401) {
      return null;
    }
    return response;
  }

  async asignSpotifyGenresToUser(userId: number, access_token?: string) {
		if (!access_token) {
			const refreshToken = await this.getDecryptedRefreshTokenByUserId(userId);
			if (!refreshToken)
				throw new UnauthorizedException(
					'Refresh token is invalid',
				);
			access_token = await this.getNewSpotifyAccessToken(userId, refreshToken)
		}

    const genresNames = await this.getSpotifyGenresByUserId(
      userId,
      access_token,
    );
    const genres = await this.genreService.findGenresByNames(genresNames);
    const vector = await this.genreService.calculateUserGenreVector(
      genres.map((genre) => genre.id),
    );

    await this.userService.updateUserPreferences({
      userId,
      genresIds: genres.map((genre) => genre.id),
      genresVector: vector,
    });
  }

  private async getSpotifyGenresByUserId(
    userId: number,
    access_token: string,
    limit: number = 10,
  ): Promise<string[]> {
    let response = await this.tryFetchSpotifyUserTopArtists(
      access_token,
      limit,
    );
    if (!response) {
      const refreshToken = await this.getDecryptedRefreshTokenByUserId(userId);
      if (!refreshToken)
        throw new UnauthorizedException(
          'Refresh token is invalid',
        );
      const newAccessToken = await this.getNewSpotifyAccessToken(
        userId,
        refreshToken,
      );

      response = await this.tryFetchSpotifyUserTopArtists(
        newAccessToken,
        limit,
      );

      if (!response)
        throw new InternalServerErrorException(
          'Something went wrong when trying to access Spotify',
        );
    }

    const json = (await response.json()) as SpotifyUserTopArtistsResponse;
    let genres: string[] = [];
    json.items.map((item) => (genres = [...genres, ...item.genres]));
    return genres;
  }

  private async getNewSpotifyAccessToken(
    userId: number,
    refreshToken: string,
  ): Promise<string> {
    const authBase64 = Buffer.from(
      `${this.configService.get('SPOTIFY_CLIENT_ID')}:${this.configService.get(
        'SPOTIFY_CLIENT_SECRET',
      )}`,
    ).toString('base64');

    const payload: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authBase64}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    };
    const url = 'https://accounts.spotify.com/api/token';

    const response = await fetch(url, payload).catch(() => {
      throw new InternalServerErrorException(
        'Something went wrong when trying to get new Spotify access token',
      );
    });
    if (response.status !== 200) {
      await this.deleteRefreshTokenByUserId(userId);
      throw new UnauthorizedException(
        'Recieved invalid response code from Spotify',
      );
    }
    const json = (await response.json()) as SpotifyRefreshTokenResponse;
		console.log(json)
    if (!checkSpotifyRefreshTokenJSON(json))
      throw new InternalServerErrorException(
        'Recieved invalid response body from Spotify',
      );

		if (!json.refresh_token) json.refresh_token = refreshToken;

    await this.updateByUserId(userId, json.refresh_token);

    return json.access_token;
  }

  private async deleteRefreshTokenByUserId(userId: number): Promise<void> {
    await this.repository.deleteByUserId(userId);
  }

  async encryptRefreshTokenAndSaveToDB(
    refreshToken: string,
    userId: number,
  ): Promise<string> {
    const encryptedRefreshToken =
      await this.cryptoService.encryptRefreshToken(refreshToken);

    await this.repository.create(encryptedRefreshToken, userId);

    return encryptedRefreshToken;
  }

  async getDecryptedRefreshTokenByUserId(
    userId: number,
  ): Promise<string | null> {
    const refreshToken = await this.repository.findByUserId(userId);

    if (!refreshToken) {
      return null;
    }

    const decryptedToken = await this.cryptoService.decryptRefreshToken(
      refreshToken?.refreshToken,
    );
    return decryptedToken;
  }

  async updateByUserId(userId: number, token: string): Promise<void> {
    const encryptedRefreshToken =
      await this.cryptoService.encryptRefreshToken(token);

    await this.repository.updateByUserId(userId, encryptedRefreshToken);
  }

  async checkRefreshToken(
    refreshToken: string,
    userId: number,
  ): Promise<boolean> {
    const refreshTokenFromDB = await this.repository.findByUserId(userId);

    if (!refreshTokenFromDB) {
      return false;
    }

    const decryptedRefreshToken = await this.cryptoService.decryptRefreshToken(
      refreshTokenFromDB.refreshToken,
    );

    if (decryptedRefreshToken === refreshToken) {
      return true;
    }

    return false;
  }
}
