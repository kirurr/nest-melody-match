import { Injectable } from '@nestjs/common';
import { GoogleAuthService } from './google-auth/google-auth.service';
import { UserService } from '../user/user.service';
import { User } from '@prisma/client';
import { JwtService } from '../jwt/jwt.service';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { TokensPairDTO } from './dto/tokens-pair.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly googleAuthService: GoogleAuthService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  public async handleAuth(userData: {
    email: string;
    name: string;
  }): Promise<TokensPairDTO> {
    let user: User | null;
    user = await this.userService.findUserByEmail(userData.email);

    let refreshToken: string | null;

    if (!user) {
      user = await this.userService.createUser({
        name: userData.name,
        email: userData.email,
      });

      refreshToken = await this.jwtService.signRefreshToken(user.id);

      await this.refreshTokenService.encryptRefreshTokenAndSaveToDB(
        refreshToken,
        user.id,
      );
    } else {
      refreshToken =
        await this.refreshTokenService.getDecryptedRefreshTokenByUserId(
          user.id,
        );

      if (!refreshToken) {
        refreshToken = await this.jwtService.signRefreshToken(user.id);
        await this.refreshTokenService.encryptRefreshTokenAndSaveToDB(
          refreshToken,
          user.id,
        );
      } else {
        try {
          await this.jwtService.verifyRefreshToken(refreshToken);
          //eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          refreshToken = await this.jwtService.signRefreshToken(user.id);
          await this.refreshTokenService.updateByUserId(user.id, refreshToken);
        }
      }
    }

    const accessToken = await this.jwtService.signAccessToken(user.id);

    return { accessToken, refreshToken };
  }

  public async googleAuth(
    code: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_tokens, userData] =
      await this.googleAuthService.retireveTokensAndUserData(code);

    return await this.handleAuth(userData);
  }

  public async getNewTokensPairByRefreshToken(
    refreshToken: string,
  ): Promise<TokensPairDTO> {
    const decryptedRefreshTokenData = await this.jwtService
      .verifyRefreshToken(refreshToken)
      .catch(() => {
        throw new Error('Refresh token is invalid');
      });

    const newRefreshToken = await this.jwtService.signRefreshToken(
      decryptedRefreshTokenData.userId,
    );

    await this.refreshTokenService.updateByUserId(
      decryptedRefreshTokenData.userId,
      newRefreshToken,
    );

    const newAccessToken = await this.jwtService.signAccessToken(
      decryptedRefreshTokenData.userId,
    );

    return { refreshToken: newRefreshToken, accessToken: newAccessToken };
  }
}
