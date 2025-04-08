import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsNumberString, IsOptional } from "class-validator";
import { FindNearestUsers } from "../user.types";

export class FindNearestUsersDTO implements Omit<FindNearestUsers, 'userId'> {
	@IsOptional()
	@IsNumberString()
	@ApiProperty({
		description: 'Number of users to return',
		default: 2
	})
  limit: number = 2;

	@IsOptional()
	@IsArray()
	@IsNumber()
	@ApiProperty({
		description: 'Array of user ids that have been seen',
		default: [],
		isArray: true
	})
	seen: number[] = [];
}