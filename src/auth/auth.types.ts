export type GoogleUser = {
	name: string;
	email: string
	picture: string
	accessToken: string
}

export type SpotifyUser = {
	tokens: {
		accessToken: string
		refreshToken: string
	}
	name: string
	email: string
	picture: string | undefined
}

export type AuthorizedUser = {
	id: number
}