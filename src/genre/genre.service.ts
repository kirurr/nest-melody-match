import { Injectable } from '@nestjs/common';
import { GenreRepository } from './genre.repository';

@Injectable()
export class GenreService {
	constructor(private readonly genreRepository: GenreRepository) {}

	async calculateUserGenreVector(genresIds: number[]): Promise<number[]> {
		const genres = await this.genreRepository.getGenresByIds(genresIds);
		const vector = [0, 0, 0, 0, 0];

		genres.forEach((genre) => {
			genre.vector.forEach((value, index) => {
				vector[index] += value;
			});
		});

		return vector;
		}
}
