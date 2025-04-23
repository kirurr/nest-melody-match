import { ApiProperty } from '@nestjs/swagger';
import { PreferencesSex } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

export class CreateUserPreferencesDTO {
  @IsArray()
  @IsNotEmpty()
  @ApiProperty({
    description: 'List of ids of genres',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsNumber({}, { each: true })
  genresIds: number[];

  @IsNotEmpty()
  @IsEnum(PreferencesSex)
  @ApiProperty({
    enum: PreferencesSex,
  })
  desiredSex: PreferencesSex;
}
