import { ArgumentMetadata, BadRequestException, ValidationPipe } from "@nestjs/common";
import { CreateUserDataDTO } from "./create-user-data.dto";

describe('CreateUserDataDTO', () => {
	const target = new ValidationPipe();
	const metadata: ArgumentMetadata = {
		type: 'query',
		metatype: CreateUserDataDTO,
		data: '',
	};

	it('should pass with correct data', () => {
		const correctUserData: CreateUserDataDTO = {
			age: 20,
			sex: 'MALE',
			displayName: 'correct name',
		}

		expect(
			async () => await target.transform(correctUserData, metadata) as void
		).not.toThrow()
	})

	it('should throw an BadRequestException if data is incorrect', async () => {
		const incorrectUserData = {
			age: '',
			sex: '',
			displayName: '',
		}

		await expect (
			async () => await target.transform(incorrectUserData, metadata) as void
		).rejects.toThrow(BadRequestException)
	})
}) 