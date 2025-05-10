import { Injectable } from '@nestjs/common';
import { SpotifyRepository } from './spotify.repository';
import { CryptoService } from '../refresh-token/crypto-service';

@Injectable()
export class SpotifyService {
  constructor(
    private readonly repository: SpotifyRepository,
    private readonly cryptoService: CryptoService,
  ) {}

  // async getSpotifyGenresByUser(user: User): Promise<string[]> {

  // };

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

    await this.repository.updateByUserId(
      userId,
      encryptedRefreshToken,
    );
  }

  async checkRefreshToken(
    refreshToken: string,
    userId: number,
  ): Promise<boolean> {
    const refreshTokenFromDB =
      await this.repository.findByUserId(userId);

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
