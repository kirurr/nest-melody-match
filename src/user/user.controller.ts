import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserDataDTO } from './dto/create-user-data.dto';
import { UserService } from './user.service';
import { Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AuthorizedUserId } from '../decorators/authorized-user-id.decorator';
import { createUserPreferencesDTO } from './dto/create-user-preferences.dto';
import { GenreService } from 'src/genre/genre.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly genreService: GenreService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('data')
  async createUserData(
    @Body(new ValidationPipe()) body: CreateUserDataDTO,
    @Res() res: Response,
    @AuthorizedUserId() userId: number,
  ) {
    try {
      await this.userService.createUserData({
        age: body.age,
        sex: body.sex,
        displayName: body.displayName,
        user: { connect: { id: userId } },
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException('UserData for that user already exists');
      } else {
        throw e;
      }
    }

    res.sendStatus(201);
  }

  @UseGuards(AuthGuard)
  @Post('preferences')
  async createUserPreferences(
    @Body(new ValidationPipe()) body: createUserPreferencesDTO,
    @Res() res: Response,
    @AuthorizedUserId() userId: number,
  ) {
    const userVector = await this.genreService.calculateUserGenreVector(
      body.genresIds,
    );

    try {
      await this.userService.createUserPreferences({
        desiredSex: body.desiredSex,
        userId: userId,
        genresVector: userVector,
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException(
          'UserPreferences for that user already exists',
        );
      } else {
        throw e;
      }
    }

    res.sendStatus(201);
  }
}
