import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { FindNearestUsers } from '../../user/user.types';
import { Transform, Type } from 'class-transformer';

export class FindNearestUsersDTO implements Omit<FindNearestUsers, 'userId'|'seen'> {
  @IsOptional()
  @IsNumberString()
  @ApiProperty({
    description: 'Number of users to return',
    default: 2,
    required: false,
  })
  limit: number = 2;

  @IsOptional()
  @IsString()
  seen: string;
}

