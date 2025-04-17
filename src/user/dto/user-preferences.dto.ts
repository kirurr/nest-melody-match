import { ApiProperty } from '@nestjs/swagger';
import { $Enums, UserPreferences } from '@prisma/client';
import { GenreDTO } from 'src/genre/dto/genre.dto';

export default class UserPreferencesDTO implements UserPreferences {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty({
    enum: $Enums.PreferencesSex,
  })
  desiredSex: $Enums.PreferencesSex;

  @ApiProperty({
    isArray: true,
    type: GenreDTO
  })
  genres: GenreDTO[];
}
