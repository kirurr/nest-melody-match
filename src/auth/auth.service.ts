import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenService } from 'src/refresh-token/refresh-token.service';
import { UserService } from 'src/user/user.service';
import { GoogleUser } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly userService: UserService,
  ) {}

  async handleOAuth(reqUser: GoogleUser): Promise<{
    access_token: string;
    refresh_token: string;
    isNewUser: boolean;
  }> {
		let isNewUser = false;
    let user = await this.userService.findUserByEmail(reqUser.email);
    let refresh_token: string | null;

    if (!user) {
      user = await this.userService.createUser({
        email: reqUser.email,
        name: reqUser.displayName,
      });

      refresh_token = this.jwtService.sign(
        { id: user.id.toString() },
        { expiresIn: '7d' },
      );
      await this.refreshTokenService.encryptRefreshTokenAndSaveToDB(
        refresh_token,
        user.id,
      );

			isNewUser = true;
    } else {
      refresh_token =
        await this.refreshTokenService.getDecryptedRefreshTokenByUserId(
          user.id,
        );

      if (!refresh_token) {
        refresh_token = this.jwtService.sign(
          { id: user.id.toString() },
          { expiresIn: '7d' },
        );
        await this.refreshTokenService.updateByUserId(user.id, refresh_token);
      }
    }

    const access_token = this.jwtService.sign(
      { id: user.id.toString() },
      { expiresIn: '1h' },
    );
		return { access_token, refresh_token, isNewUser };
	}
}
