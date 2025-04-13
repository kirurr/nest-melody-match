import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsNumberString, IsOptional } from "class-validator";
import { FindNearestUsers } from "../../user/user.types";
import { Transform } from "class-transformer";

export class FindNearestUsersDTO implements Omit<FindNearestUsers, 'userId'> {
	@IsOptional()
	@IsNumberString()
	@ApiProperty({
		description: 'Number of users to return',
		default: 2,
		required: false
	})
  limit: number = 2;

	@IsOptional()
	@IsArray()
	@IsNumber({}, { each: true })
	@ApiProperty({
		description: 'Array of user ids that have been seen',
		isArray: true,
		required: false,
		type: Number
	})
	@Transform(({ value }) => {
    let seen: number[];
    if (value === undefined) {
      seen = [];
    } else if (value === null) {
      seen = [];
    } else {
      if (Array.isArray(value)) {
        seen = value.map((id) => +id);
      } else {
        seen = [+value];
      }
    }
		return seen;
	})
	seen: number[] = [];
}