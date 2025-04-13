import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { FindNearestUsersDTO } from '../user/dto/find-nearest-users.dto';
import { UserDto } from '../user/dto/user-dto';
import { UserService } from '../user/user.service';
import { Response } from 'express';
import { AuthorizedUserDTO } from '../auth/dto/authorized-user.dto';
import { AuthorizedUser } from '../decorators/authorized-user.decorator';
import CreateMatchDTO from './dto/create-match.dto';
import { MatchService } from './match.service';
import MatchDTO from './dto/match.dto';
import AcceptMatchDTO from './dto/accept-match.dto';

@Controller('match')
export class MatchController {
  constructor(
    private readonly userService: UserService,
    private readonly matchService: MatchService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a match between the user and the specified user',
    description: 'Provide liked userId to create match',
  })
  @ApiCreatedResponse({
    description: 'Match created successfully',
  })
  async createMatch(
    @Body(new ValidationPipe()) body: CreateMatchDTO,
    @AuthorizedUser() user: AuthorizedUserDTO,
    @Res() res: Response,
  ) {
    await this.matchService.createMatch({
      whoLikes: user.id,
      whoIsLiked: body.likedUserId,
    });
    res.sendStatus(201);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns list of accepted matches',
    type: [MatchDTO],
    example: [
      {
        id: 1,
        userId: 1,
        likedUserId: 2,
        isAccepted: true,
      },
    ],
  })
  @ApiOperation({
    summary: 'Get accepted matches',
    description: 'Get accepted matches for the user',
  })
  @Get('accept')
  async getAcceptedMatches(@AuthorizedUser() user: AuthorizedUserDTO) {
    return await this.matchService.getAcceptedMatches(user.id);
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Match accepted successfully',
  })
  @ApiOperation({
    summary: 'Accept a match',
    description: 'Accept a match between the user and the specified user',
  })
  @Post('accept')
  async acceptMatch(
    @Body(new ValidationPipe()) body: AcceptMatchDTO,
    @AuthorizedUser() user: AuthorizedUserDTO,
    @Res() res: Response,
  ) {
    await this.matchService.acceptMatch({
      id: body.id,
      userId: user.id,
    });
    res.sendStatus(201);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Find closest matches for the user',
    description: 'Find users by musical vector, age, prefered gender',
  })
  @ApiOkResponse({
    description: 'Returns list of nearest users',
    type: [UserDto],
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('find')
  async searchNearestUsers(
    @Query(new ValidationPipe()) query: FindNearestUsersDTO,
    @AuthorizedUser() user: AuthorizedUserDTO,
    @Res() res: Response,
  ) {
    res.send(
      await this.userService.findNearestUsersByUserId({
        userId: user.id,
        limit: query.limit,
        seen: query.seen,
      }),
    );
  }
}
