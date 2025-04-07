import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class TokensPairDTO {
	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	accessToken: string

	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	refreshToken: string
}