import { IsNotEmpty, IsNumber } from "class-validator";
import MatchDTO from "./match.dto";
import { ApiProperty } from "@nestjs/swagger";

export default class CreateMatchDTO implements Pick<MatchDTO, "likedUserId"> {
	@ApiProperty()
	@IsNumber()
	@IsNotEmpty()
	likedUserId: number;
}

