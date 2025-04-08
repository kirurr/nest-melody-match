import { Injectable } from '@nestjs/common';
import { RefreshTokenRepository } from './refresh-token.repository';
import { CryptoService } from './crypto-service';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly cryptoService: CryptoService,
  ) {}

  async encryptRefreshTokenAndSaveToDB(
    refreshToken: string,
    userId: number,
  ): Promise<string> {
    const encryptedRefreshToken =
      await this.cryptoService.encryptRefreshToken(refreshToken);

    await this.refreshTokenRepository.create(encryptedRefreshToken, userId);

    return encryptedRefreshToken;
  }

  async getDecryptedRefreshTokenByUserId(
    userId: number,
  ): Promise<string | null> {
    const refreshToken = await this.refreshTokenRepository.findByUserId(userId);

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

    await this.refreshTokenRepository.updateByUserId(
      userId,
      encryptedRefreshToken,
    );
  }

  async checkRefreshToken(
    refreshToken: string,
    userId: number,
  ): Promise<boolean> {
    const refreshTokenFromDB =
      await this.refreshTokenRepository.findByUserId(userId);

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
