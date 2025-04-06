import { PreferencesSex } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

export class CreateUserPreferencesDTO {
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  genresIds: number[];

  @IsNotEmpty()
  @IsEnum(PreferencesSex)
  desiredSex: PreferencesSex;
}
