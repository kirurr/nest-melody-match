import { Genre } from './genre.type';
import { Injectable } from '@nestjs/common';
import { Genre as PrismaGenre } from '@prisma/client';
import { PrismaService } from '../prisma.service';


@Injectable()
export class GenreRepository {
  constructor(private readonly db: PrismaService) {}

	async findGenresByNames(genresNames: string[]): Promise<PrismaGenre[]> {
		return await this.db.genre.findMany({
			where: {
				OR: genresNames.map((name) => ({
					name: {
						contains: name,
						mode: 'insensitive',
					},
				})),
			}
		})
	}

  async getGenresByIds(genresIds: number[]): Promise<Genre[]> {
    const rawGenres: {
      id: number;
      name: string;
      vector: string;
    }[] = await this.db
      .$queryRaw`SELECT "id", "name", CAST("vector" AS TEXT) as "vector"
      FROM "Genre" WHERE id = ANY(${genresIds})`;

    return rawGenres.map((genre) => ({
      ...genre,
      vector: JSON.parse(genre.vector) as number[],
    }));
  }
}
