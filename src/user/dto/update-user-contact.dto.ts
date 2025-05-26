import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { UserContactDTO } from "./user-contact.dto";

export class UpdateUserContactDTO extends PartialType(OmitType(UserContactDTO, ['id'])){
	@IsNumber()
	@IsNotEmpty()
	@ApiProperty()
	id: number;

	@ApiProperty({
		required: false,
	})
	@IsString()
  @IsOptional()
	@IsNotEmpty()
  name: string;

	@ApiProperty({
		required: false
	})
	@IsString()
  @IsOptional()
	@IsNotEmpty()
  value: string;
}
