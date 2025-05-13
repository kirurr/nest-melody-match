import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile, VerifyCallback } from "passport-spotify";

@Injectable()
export class SpotifyStrategy extends PassportStrategy(Strategy, 'spotify') {
	constructor(private readonly configService: ConfigService) {
		super({
			clientID: configService.get<string>('SPOTIFY_CLIENT_ID')!,
			clientSecret: configService.get<string>('SPOTIFY_CLIENT_SECRET')!,
			callbackURL: configService.get<string>('SPOTIFY_REDIRECT_URI')!,
			scope: ['user-read-email', 'user-read-private', 'user-top-read'],
		})
	}

	validate(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) {
		if (!profile.emails) done(new Error('No email'));

		const user = {
			tokens: {
				accessToken,
				refreshToken,
			},
			name: profile.displayName,
			email: profile.emails![0].value,
			picture: profile.photos ? profile.photos[0] : undefined,
		}
		done(null, user)
	}
}