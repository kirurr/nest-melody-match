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

  @ApiProperty()
  userPreferences: UserPreferencesDTO | null;

  @ApiProperty()
  userData: UserDataDTO | null;
}
