import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { AuthorizedUserId } from './decorators/authorized-user-id.decorator';
import { GenreService } from './genre/genre.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly genreService: GenreService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('guard')
  getGuard(@AuthorizedUserId() userId: number) {
    return userId;
  }

  @Get('genre')
  async getGenre() {
    return await this.genreService.calculateUserGenreVector([1, 2, 3, 4, 5]);
  }
}
