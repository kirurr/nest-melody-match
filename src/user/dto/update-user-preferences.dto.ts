import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import UserPreferencesDTO from './user-preferences.dto';

export default class UpdateUserPreferencesDTO extends PartialType(
  OmitType(UserPreferencesDTO, ['id', 'userId', 'genres']),
) {
  @IsString({ each: true })
  @IsEnum($Enums.PreferencesSex)
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    enum: $Enums.PreferencesSex,
    required: false,
    example: 'MALE',
  })
  desiredSex: $Enums.PreferencesSex;

  @IsNumber({}, { each: true })
  @IsOptional()
  @ApiProperty({
    required: false,
    example: [1, 2, 3],
  })
  @IsArray()
  @IsNotEmpty()
  genresIds: number[];
}
