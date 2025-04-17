import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';

export class GetUserDTO {
  @ApiProperty({
    required: false,
		example: 1,
		description: 'If not provided, returns user with id equal to user id in auth token',
  })
  @IsOptional()
  @IsNumberString()
  id: string;
}
