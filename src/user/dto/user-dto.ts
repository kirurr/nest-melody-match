import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class UserDto implements User {
  @ApiProperty({
		example: "John Doe"
	})
  name: string;

  @ApiProperty({
		example: "john.doe@example.com"
	})
  email: string;

  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
