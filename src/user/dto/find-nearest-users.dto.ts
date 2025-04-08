import { ApiProperty } from "@nestjs/swagger";
import { IsNumberString, IsOptional } from "class-validator";

export class FindNearestUsersDTO {
	@IsOptional()
	@IsNumberString()
	@ApiProperty({
		description: 'Number of users to return',
		default: '2'
	})
  limit: string;
}