import { SpotifyRefreshTokenResponse } from './spotify.types';

export function checkSpotifyRefreshTokenJSON(
  data: SpotifyRefreshTokenResponse,
) {
  if (
    typeof data === 'object' &&
    data !== null &&
    typeof data.access_token === 'string'
  ) {
    return true;
  }
	return false;
}
