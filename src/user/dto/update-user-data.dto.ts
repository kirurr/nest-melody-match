import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import UserDataDTO from './user-data.dto';
import { $Enums } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export default class UpdateUserDataDTO extends PartialType(
  OmitType(UserDataDTO, ['id', 'userId']),
) {
  @ApiProperty({
    required: false,
		example: 54
  })
  @IsOptional()
	@IsNotEmpty()
  @IsNumber()
	@Min(18)
  age: number;

  @IsString({ each: true })
  @IsEnum($Enums.Sex)
	@IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    enum: $Enums.Sex,
    required: false,
		example: 'MALE'
  })
  sex: $Enums.Sex;

  @IsString()
  @IsOptional()
	@IsNotEmpty()
  @ApiProperty({
    required: false,
		example: 'Glad Valakas'
  })
  displayName: string;
}
