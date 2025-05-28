import { ApiProperty } from "@nestjs/swagger";
import MatchDTO from "./match.dto";
import { UserDto } from "src/user/dto/user-dto";

export class UserDataMatchDTO {
	@ApiProperty()
	match: MatchDTO;

	@ApiProperty()
	user: UserDto;
}
