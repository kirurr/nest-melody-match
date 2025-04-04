import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

export class createUserPreferencesDTO {
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  genresIds: number[];

  @IsNotEmpty()
  @IsEnum({ MALE: 'MALE', FEMALE: 'FEMALE' })
  desiredSex: 'MALE' | 'FEMALE';
}
