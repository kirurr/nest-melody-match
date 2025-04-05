import { Prisma, Sex } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateUserDataDTO implements Omit<Prisma.UserDataCreateInput, 'user'> {
	@IsNumber()
	@IsNotEmpty()
	age: number

	@IsEnum(Sex)
	@IsNotEmpty()
	sex: Sex

	@IsString()
	@IsNotEmpty()
	displayName: string
}