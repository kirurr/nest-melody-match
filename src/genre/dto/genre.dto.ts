import { ApiProperty } from "@nestjs/swagger";
import { Genre } from "@prisma/client";

export class GenreDTO implements Genre {
	@ApiProperty()
	id: number;

	@ApiProperty()
	name: string;
}