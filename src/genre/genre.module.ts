import { Module } from '@nestjs/common';
import { GenreService } from './genre.service';
import { PrismaService } from '../prisma.service';
import { GenreRepository } from './genre.repository';

@Module({
  providers: [GenreService, PrismaService, GenreRepository],
  exports: [GenreService]
})
export class GenreModule {}
