import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { GenreService } from './genre/genre.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly genreService: GenreService,
  ) {}

  // @UseGuards(AuthGuard)
  @UseGuards(AuthGuard('jwt'))
  @Get('guard')
  @ApiBearerAuth()
  getGuard() {
    return {nigger: 'nigger'};
  }

  @Get('genre')
  async getGenre() {
    return await this.genreService.calculateUserGenreVector([1, 2, 3, 4, 5]);
  }
}
