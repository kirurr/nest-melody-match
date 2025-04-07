import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { GenreService } from './genre/genre.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly genreService: GenreService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('guard')
  @ApiBearerAuth()
  getGuard() {
    return { message: 'Hello world!' };
  }

  @Get('genre')
  async getGenre() {
    return await this.genreService.calculateUserGenreVector([1, 2, 3, 4, 5]);
  }
}
