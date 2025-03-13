import { Injectable } from '@nestjs/common';
import { JwtService as JwtNestService } from '@nestjs/jwt';

@Injectable()
export class JwtService {
  constructor(private readonly jwtService: JwtNestService) {}

  public async signAccessToken(userId: number) {
    return await this.jwtService.signAsync({ userId }, { expiresIn: '1h' });
  }

  public async signRefreshToken(userId: number) {
    return await this.jwtService.signAsync({ userId }, { expiresIn: '30d' });
  }

  public async verifyAccessToken(accessToken: string) {
    return await this.jwtService.verifyAsync<{ userId: number }>(accessToken);
  }

  public async verifyRefreshToken(refreshToken: string) {
    return await this.jwtService.verifyAsync<{ userId: number }>(refreshToken);
  }
}
