import { Prisma } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateUserDataDTO implements Omit<Prisma.UserDataCreateInput, 'user'> {
	@IsNumber()
	@IsNotEmpty()
	age: number

	@IsEnum({
		MALE: 'MALE',
		FEMALE: 'FEMALE'
	})
	@IsNotEmpty()
	sex: 'MALE' | 'FEMALE'

	@IsString()
	@IsNotEmpty()
	displayName: string
}