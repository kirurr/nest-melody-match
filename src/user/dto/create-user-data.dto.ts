import { ApiProperty } from "@nestjs/swagger";
import { Prisma, Sex } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";

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
}