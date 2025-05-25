import { Module } from '@nestjs/common';
import { GenreService } from './genre.service';
import { PrismaService } from '../prisma.service';
import { GenreRepository } from './genre.repository';
import { GenreController } from './genre.controller';

@Module({
  providers: [GenreService, PrismaService, GenreRepository],
  exports: [GenreService],
  controllers: [GenreController]
})
export class GenreModule {}
