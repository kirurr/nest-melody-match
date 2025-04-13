import { ApiProperty } from "@nestjs/swagger";
import { Match } from "@prisma/client";

export default class MatchDTO implements Match {
	@ApiProperty()
	id: number;

	@ApiProperty()
	userId: number;

	@ApiProperty()
	likedUserId: number;

	@ApiProperty()
	isAccepted: boolean = false;	
}