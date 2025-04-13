import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export default class AcceptMatchDTO {
	@ApiProperty({
		description: 'Match id',
	})
	@IsNumber()
	@IsNotEmpty()
	id: number;
}