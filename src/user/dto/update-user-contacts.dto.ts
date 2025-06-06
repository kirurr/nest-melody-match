import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateUserContactDTO } from './update-user-contact.dto';

export class UpdateUserContactsDTO {
	@ApiProperty({type: [UpdateUserContactDTO], description: 'Array of user contacts'})
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateUserContactDTO)
  contacts: UpdateUserContactDTO[];
}

