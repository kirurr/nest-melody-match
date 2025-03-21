import { Injectable } from '@nestjs/common';
import {
  GoogleAuthProvider,
  GoogleTokens,
  GoogleUserData,
} from './google-auth.provider';

@Injectable()
export class GoogleAuthService {
  constructor(private readonly googleAuthProvider: GoogleAuthProvider) {}

  public async retireveTokensAndUserData(
    authCode: string,
  ): Promise<[GoogleTokens, GoogleUserData]> {
    const tokens = await this.googleAuthProvider.getAuthTokens(authCode);
    const userData = await this.googleAuthProvider.getUserData(
      tokens.access_token,
    );

    return [tokens, userData];
  }
}
