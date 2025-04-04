import { Genre } from './genre.type';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';


@Injectable()
export class GenreRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getGenresByIds(genresIds: number[]): Promise<Genre[]> {
    const rawGenres: {
      id: number;
      name: string;
      vector: string;
    }[] = await this.prismaService
      .$queryRaw`SELECT "id", "name", CAST("vector" AS TEXT) as "vector"
      FROM "Genre" WHERE id = ANY(${genresIds})`;

    return rawGenres.map((genre) => ({
      ...genre,
      vector: JSON.parse(genre.vector) as number[],
    }));
  }
}
