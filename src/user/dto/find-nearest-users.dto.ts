import { IsNumberString, IsOptional } from "class-validator";

export class FindNearestUsersDTO {
	@IsOptional()
	@IsNumberString()
  limit: string;
}