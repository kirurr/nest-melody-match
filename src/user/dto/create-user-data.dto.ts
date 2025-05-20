import { ApiProperty } from "@nestjs/swagger";
import { Prisma, Sex } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateUserDataDTO implements Omit<Prisma.UserDataCreateInput, 'user'> {
	@IsNumber()
	@IsNotEmpty()
	@ApiProperty({
		example: 20
	})
	age: number

	@ApiProperty({
		enum: Sex,
	})
	@IsEnum(Sex)
	@IsNotEmpty()
	sex: Sex

	@ApiProperty({
		example: 'John Doe'
	})
	@IsString()
	@IsNotEmpty()
	displayName: string

	@ApiProperty({
		example: 'Some about text',
		required: false
	})
	@IsString()
	@IsOptional()
	about: string

	@ApiProperty({
		example: 'http://some.image.url',
		required: false
	})
	@IsString()
	@IsOptional()
	imageUrl: string
}