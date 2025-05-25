import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString } from "class-validator";

export class FindGenresByOneNameDTO {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({required: false})
	@IsNumberString()
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	limit: string;
}
