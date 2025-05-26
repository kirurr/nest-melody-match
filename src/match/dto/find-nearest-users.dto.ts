import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { FindNearestUsers } from '../../user/user.types';

export class FindNearestUsersDTO implements Omit<FindNearestUsers, 'userId'|'seen'> {
  @IsOptional()
  @IsNumberString()
  @ApiProperty({
    description: 'Number of users to return',
    default: 2,
    required: false,
  })
  limit: number;

  @IsOptional()
  @IsString()
  seen: string;
}

