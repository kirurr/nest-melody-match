import { ApiProperty } from '@nestjs/swagger';
import { $Enums, UserPreferences } from '@prisma/client';

export default class UserPreferencesDTO implements UserPreferences {
	@ApiProperty({
		isArray: true,
	})
	genresIds: number[];

  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty({
    enum: $Enums.PreferencesSex,
  })
  desiredSex: $Enums.PreferencesSex;
}
