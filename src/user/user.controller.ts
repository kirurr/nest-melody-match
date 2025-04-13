import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
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
import { AuthorizedUserDTO } from '../auth/dto/authorized-user.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserDto } from './dto/user-dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly genreService: GenreService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user',
    description: 'Get user with data and preferences by id',
  })
  @ApiOkResponse({
    description: 'User with data and preferences',
    type: UserDto,
  })
  async getUser(@AuthorizedUser() user: AuthorizedUserDTO) {
    return await this.userService.getUser(user.id);
  }

  @ApiOperation({
    summary: 'Create user data',
    description: 'Create user data for signed in user',
  })
  @ApiCreatedResponse({
    description: 'UserData is created',
  })
  @ApiBadRequestResponse({
    description: 'UserData for that user already exists',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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

  @ApiOperation({
    summary: 'Create user preferences',
    description: 'Create user preferences for signed in user',
  })
  @ApiCreatedResponse({
    description: 'UserPreferences is created',
  })
  @ApiBadRequestResponse({
    description: 'UserPreferences for that user already exists',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
        genresIds: body.genresIds,
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
