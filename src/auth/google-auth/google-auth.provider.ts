import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type GoogleTokens = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
};

export type GoogleUserData = {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  picture: string;
};

@Injectable()
export class GoogleAuthProvider {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get('GOOGLE_CLIENT_ID')!;
    this.clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET')!;
    this.redirectUri = this.configService.get('GOOGLE_REDIRECT_URI')!;
  }

  public async getAuthTokens(code: string): Promise<GoogleTokens> {
    const googleTokenParams = new URLSearchParams({
      code: code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      grant_type: 'authorization_code',
    });

    const googleTokensResponse = await fetch(
      'https://oauth2.googleapis.com/token' +
        '?' +
        googleTokenParams.toString(),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    const googleTokens = (await googleTokensResponse.json()) as GoogleTokens;

    return googleTokens;
  }

  public async getUserData(accessToken: string): Promise<GoogleUserData> {
    const userDataResponse = await fetch(
      'https://www.googleapis.com/userinfo/v2/me',
      {
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
      },
    );

    const userData = (await userDataResponse.json()) as GoogleUserData;
    return userData;
  }
}
