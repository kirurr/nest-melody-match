import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleAndroidStrategy extends PassportStrategy(Strategy, 'google-android') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GOOGLE_ANDROID_REDIRECT_URI')!,
      scope: ['email', 'profile'],
			authorizationURL: 'https://accounts.google.com/o/oauth2/auth?prompt=consent',
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const { name, emails, photos } = profile as {
      name: { givenName: string; familyName: string };
      emails: Array<{ value: string }>;
      photos: Array<{ value: string }>;
    };
    const user = {
      email: emails[0].value,
      name: name.givenName,
      picture: photos[0].value,
      accessToken, // Передаем токен для дальнейшего использования
    };
    done(null, user);
  }
}
