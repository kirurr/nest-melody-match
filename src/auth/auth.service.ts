import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { UserService } from '../user/user.service';
import { GoogleUser } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly userService: UserService,
  ) {}

  async hanleRefreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    let userId: number;
    try {
      userId = this.jwtService.verify<{ id: number }>(refreshToken).id;
      //eslint-disable-next-line
    } catch (e) {
      return null;
    }

    const isValidToken = await this.refreshTokenService.checkRefreshToken(
      refreshToken,
      userId,
    );

    if (!isValidToken) return null;

    const newRefreshToken = this.jwtService.sign(
      { id: userId.toString() },
      { expiresIn: '7d' },
    );

    await this.refreshTokenService.updateByUserId(userId, newRefreshToken);

    const newAccessToken = this.jwtService.sign(
      { id: userId.toString() },
      { expiresIn: '1h' },
    );
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async handleOAuth(reqUser: GoogleUser): Promise<{
    accessToken: string;
    refreshToken: string;
    isNewUser: boolean;
  }> {
    let isNewUser = false;
    let user = await this.userService.findUserByEmail(reqUser.email);
    let refreshToken: string | null;

    if (!user) {
      user = await this.userService.createUser({
        email: reqUser.email,
        name: reqUser.name,
      });

      refreshToken = this.jwtService.sign(
        { id: user.id.toString() },
        { expiresIn: '7d' },
      );
      await this.refreshTokenService.encryptRefreshTokenAndSaveToDB(
        refreshToken,
        user.id,
      );

      isNewUser = true;
    } else {
      refreshToken =
        await this.refreshTokenService.getDecryptedRefreshTokenByUserId(
          user.id,
        );

      if (!refreshToken) {
        refreshToken = this.jwtService.sign(
          { id: user.id.toString() },
          { expiresIn: '7d' },
        );
        await this.refreshTokenService.updateByUserId(user.id, refreshToken);
      }
    }

    const accessToken = this.jwtService.sign(
      { id: user.id.toString() },
      { expiresIn: '1h' },
    );
    return { accessToken, refreshToken, isNewUser };
  }
}
