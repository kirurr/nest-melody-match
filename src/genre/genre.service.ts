import { Injectable } from '@nestjs/common';
import { GenreRepository } from './genre.repository';
import { Genre } from '@prisma/client';

@Injectable()
export class GenreService {
	constructor(private readonly genreRepository: GenreRepository) {}

	async findGenresByOneName(genresName: string, limit?: number): Promise<Genre[]> {
		return await this.genreRepository.findGenresByOneName(genresName, limit);
	}

	async findGenresByNames(genresNames: string[]): Promise<Genre[]> {
		const genresSet = new Set<string>(genresNames)
		return await this.genreRepository.findGenresByNames([...genresSet.keys()]);
	}

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
