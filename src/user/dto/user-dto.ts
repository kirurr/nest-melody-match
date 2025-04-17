import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import UserPreferencesDTO from './user-preferences.dto';
import UserDataDTO from './user-data.dto';

export class UserDto implements User {
  @ApiProperty({
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({
    nullable: true,
    example: {
      desiredSex: 'MALE',
      id: 1,
      userId: 1,
      genres: [
        {
          id: 1,
          name: 'Rock'
        },
        {
          id: 2,
          name: 'Stone'
        },
      ]
    } as UserPreferencesDTO
  })
  userPreferences: UserPreferencesDTO | null;

  @ApiProperty({
    nullable: true,
    example: {
      age: 25,
      displayName: 'John Doe',
      id: 1,
      sex: 'MALE',
      userId: 1,
    } as UserDataDTO
  })
  userData: UserDataDTO | null;
}
