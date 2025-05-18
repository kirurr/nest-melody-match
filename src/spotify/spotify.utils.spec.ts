import { SpotifyRefreshTokenResponse } from './spotify.types';
import { checkSpotifyRefreshTokenJSON } from './spotify.utils';

describe('checkSpotifyRefreshTokenJSON', () => {
	it('should return true if data is a valid SpotifyRefreshTokenResponse', () => {
		const data: SpotifyRefreshTokenResponse = {
			access_token: 'some-access-token',
			token_type: 'Bearer',
			expires_in: 3600,
			refresh_token: 'some-refresh-token',
			scope: 'user-read-email',
		};

		expect(checkSpotifyRefreshTokenJSON(data)).toBe(true);
	});
	it('should return false if data is not a valid SpotifyRefreshTokenResponse', () => {
		const data = { } as SpotifyRefreshTokenResponse;

		expect(checkSpotifyRefreshTokenJSON(data)).toBe(false);
	});
});