import { ApiProperty } from '@nestjs/swagger';
import { $Enums, UserData } from '@prisma/client';
import { UserContactDTO } from './user-contact.dto';

export default class UserDataDTO implements UserData {
  @ApiProperty()
  id: number;
  @ApiProperty()
  userId: number;
  @ApiProperty()
  age: number;
  @ApiProperty({
    enum: $Enums.Sex,
  })
  sex: $Enums.Sex;
  @ApiProperty()
  displayName: string;
  @ApiProperty()
  about: string;
  @ApiProperty()
  imageUrl: string;

  @ApiProperty({
		type: [UserContactDTO],
	})
	contacts?: UserContactDTO[];
}
