import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { UserContactDTO } from './user-contact.dto';
import { Type } from 'class-transformer';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';

class CreateUserContactDTO extends PartialType(OmitType(UserContactDTO, ['id'])){
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
  name: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
  value: string;
}

export class CreateUserContactsDTO {
	@ApiProperty({type: [CreateUserContactDTO], description: 'Array of user contacts'})
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUserContactDTO)
  contacts: CreateUserContactDTO[];
}

