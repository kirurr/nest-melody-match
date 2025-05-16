import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class SpotifyAccessTokenDTO {
	@ApiProperty({
		required: false
	})
	@IsOptional()
	@IsString()
	accessToken: string;
}
