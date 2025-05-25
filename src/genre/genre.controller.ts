import {
  Controller,
  Get,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { GenreService } from './genre.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GenreDTO } from './dto/genre.dto';
import { FindGenresByOneNameDTO } from './dto/find-genres-by-one-name.dto';

@Controller('genre')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @ApiOperation({
    summary: 'Find genres by one name',
    description: 'Find genres by one name',
  })
  @ApiOkResponse({
    description: 'Genres',
    type: [GenreDTO],
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  findGenresByOneName(
    @Query(new ValidationPipe()) query: FindGenresByOneNameDTO,
  ) {
    return this.genreService.findGenresByOneName(query.name, query.limit ? +query.limit : undefined);
  }
}
