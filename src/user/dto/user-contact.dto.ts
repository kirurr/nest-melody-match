import { ApiProperty } from "@nestjs/swagger";
import { UserContact } from "@prisma/client";

export class UserContactDTO implements UserContact {
	@ApiProperty()
  id: number;
	@ApiProperty()
  name: string;
	@ApiProperty()
  value: string;
}
