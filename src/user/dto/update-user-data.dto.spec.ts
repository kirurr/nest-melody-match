import { ArgumentMetadata, BadRequestException, ValidationPipe } from "@nestjs/common";
import UpdateUserDataDTO from "./update-user-data.dto";

describe('UpdateUserDataDTO', () => {
	const target = new ValidationPipe();
	const metadata: ArgumentMetadata = {
		type: 'query',
		metatype: UpdateUserDataDTO,
		data: '',
	};

	it('should pass with correct data', () => {
		const correctUserData: UpdateUserDataDTO = {
			age: 54,
			sex: 'MALE',
			displayName: 'Glad Valakas',
			about: 'Some about text',
			imageUrl: 'http://some.image.url',
		}

		expect(
			async () => await target.transform(correctUserData, metadata) as void
		).not.toThrow()
	})

	it('should throw an BadRequestException if data is incorrect', async () => {
		const incorrectUserData = {
			age: 10,
			displayName: ''
		}

		await expect (
			async () => await target.transform(incorrectUserData, metadata) as void
		).rejects.toThrow(BadRequestException)
	})
}) 