import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserDataDTO } from './dto/create-user-data.dto';
import { UserService } from './user.service';
import { Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AuthorizedUser } from '../decorators/authorized-user.decorator';
import { CreateUserPreferencesDTO } from './dto/create-user-preferences.dto';
import { GenreService } from '../genre/genre.service';
import { FindNearestUsersDTO } from './dto/find-nearest-users.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthorizedUserDTO } from '../auth/dto/authorized-user.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { UserDto } from './dto/user-dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly genreService: GenreService,
  ) {}

  @ApiCreatedResponse({
    description: 'UserData is created',
  })
  @ApiBadRequestResponse({
    description: 'UserData for that user already exists',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('data')
  async createUserData(
    @Body(new ValidationPipe()) body: CreateUserDataDTO,
    @Res() res: Response,
    @AuthorizedUser() user: AuthorizedUserDTO,
  ) {
    try {
      await this.userService.createUserData({
        age: body.age,
        sex: body.sex,
        displayName: body.displayName,
        user: { connect: { id: user.id } },
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

  @ApiCreatedResponse({
    description: 'UserPreferences is created',
  })
  @ApiBadRequestResponse({
    description: 'UserPreferences for that user already exists',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('preferences')
  async createUserPreferences(
    @Body(new ValidationPipe()) body: CreateUserPreferencesDTO,
    @Res() res: Response,
    @AuthorizedUser() user: AuthorizedUserDTO,
  ) {
    const userVector = await this.genreService.calculateUserGenreVector(
      body.genresIds,
    );

    try {
      await this.userService.createUserPreferences({
        desiredSex: body.desiredSex,
        userId: user.id,
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

  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns list of nearest users',
    type: [UserDto]
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('search')
  async searchNearestUsers(
    @Query(new ValidationPipe()) query: FindNearestUsersDTO,
    @AuthorizedUser() userId: number,
    @Res() res: Response,
  ) {
    res.send(
      await this.userService.findNearestUsersByUserId(
        userId,
        query ? +query.limit : 2,
      ),
    );
  }
}
