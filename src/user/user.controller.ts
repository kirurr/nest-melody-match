import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
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
import { AuthorizedUserDTO } from '../auth/dto/authorized-user.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserDto } from './dto/user-dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUserDTO } from './dto/get-user.dto';
import UpdateUserDataDTO from './dto/update-user-data.dto';
import UpdateUserPreferencesDTO from './dto/update-user-preferences.dto';
import { CreateUserContactsDTO } from './dto/create-user-contacts.dto';
import { UpdateUserContactDTO } from './dto/update-user-contact.dto';
import { UpdateUserContactsDTO } from './dto/update-user-contacts.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly genreService: GenreService,
  ) {}

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete user',
    description: 'Delete authorized user, userData and userPreferences',
  })
  @ApiOkResponse({
    description: 'User is deleted',
  })
  async deleteUser(
    @AuthorizedUser() user: AuthorizedUserDTO,
    @Res() res: Response,
  ) {
    await this.userService.deleteUser(user.id);
    res.sendStatus(200);
  }

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
  @ApiBadRequestResponse({
    description: 'User with provided id is not found',
  })
  async getUser(
    @Query(new ValidationPipe()) query: GetUserDTO,
    @AuthorizedUser() user: AuthorizedUserDTO,
    @Res() res: Response,
  ) {
    const result = await this.userService.getUser(
      query.id ? +query.id : user.id,
    );
    if (!result) res.sendStatus(400);
    res.send(result);
  }

  @Get('matched')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get matched user',
    description: 'Get matched user with data and contacts and preferences by id',
  })
  @ApiOkResponse({
    description: 'User with data and contacts and preferences',
    type: UserDto,
  })
  @ApiBadRequestResponse({
    description: 'User with provided id is not found',
  })
  async getMatchedUser(
    @Query(new ValidationPipe()) query: GetUserDTO,
    @AuthorizedUser() user: AuthorizedUserDTO,
    @Res() res: Response,
  ) {
    const result = await this.userService.getMatchedUser(
      query.id ? +query.id : user.id,
			user.id
    );
    if (!result) res.sendStatus(400);
    res.send(result);
  }

  @Patch('data')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user data',
    description: 'Update user data for signed in user',
  })
  @ApiOkResponse({
    description: 'UserData is updated successfully',
  })
  async updateUserData(
    @Body(new ValidationPipe()) body: UpdateUserDataDTO,
    @AuthorizedUser() user: AuthorizedUserDTO,
    @Res() res: Response,
  ) {
    await this.userService.updateUserData({ ...body, userId: user.id });
    res.sendStatus(200);
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
        user: { connect: { id: user.id } },
        ...body,
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

  @Patch('preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user preferences',
    description: 'Update user preferences for signed in user',
  })
  @ApiOkResponse({
    description: 'UserPreferences is updated successfully',
  })
  async updateUserPreferences(
    @Body(new ValidationPipe()) body: UpdateUserPreferencesDTO,
    @AuthorizedUser() user: AuthorizedUserDTO,
    @Res() res: Response,
  ) {
    let userVector: number[] | undefined;
    if (body.genresIds) {
      userVector = await this.genreService.calculateUserGenreVector(
        body.genresIds,
      );
    }

    await this.userService.updateUserPreferences({
      ...body,
      userId: user.id,
      genresVector: userVector,
    });

    res.sendStatus(200);
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

	@ApiOperation({
		summary: 'Update user contacts',
		description: 'Update user contacts for signed in user',
	})
	@ApiOkResponse({
		description: 'UserContacts is updated',
	})
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('contacts')
  async updateUserContact(
    @Body(new ValidationPipe()) body: UpdateUserContactsDTO,
		@AuthorizedUser() user: AuthorizedUserDTO,
    @Res() res: Response,
  ) {
		await this.userService.updateUserContacts(body.contacts, user.id);
		return res.sendStatus(200);
	}

	@ApiOperation({
		summary: 'Create user contacts',
		description: 'Create user contacts for signed in user',
	})
	@ApiCreatedResponse({
		description: 'UserContacts is created',
	})
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('contacts')
  async createUserContacts(
    @Body(new ValidationPipe()) body: CreateUserContactsDTO,
    @Res() res: Response,
    @AuthorizedUser() user: AuthorizedUserDTO,
  ) {
		await this.userService.createUserContacts(body.contacts, user.id);
		return res.sendStatus(201);
	}
}
