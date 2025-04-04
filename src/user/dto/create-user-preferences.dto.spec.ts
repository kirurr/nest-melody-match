import { ArgumentMetadata, BadRequestException, ValidationPipe } from "@nestjs/common";
import { createUserPreferencesDTO } from "./create-user-preferences.dto";

describe('CreateUserPreferencesDTO', () => {
	const target = new ValidationPipe();
	const metadata: ArgumentMetadata = {
		type: 'query',
		metatype: createUserPreferencesDTO,
		data: '',
	};

	it('should pass with correct data', () => {
		const correctUserData: createUserPreferencesDTO = {
			desiredSex: 'MALE',
			genresIds: [1, 1, 1, 1, 1]
		}

		expect(
			async () => await target.transform(correctUserData, metadata) as void
		).not.toThrow()
	})

	it('should throw an BadRequestException if data is incorrect', async () => {
		const incorrectUserData = {
			desiredSex: '',
			genresIds: []
		}

		await expect (
			async () => await target.transform(incorrectUserData, metadata) as void
		).rejects.toThrow(BadRequestException)
	})
}) 