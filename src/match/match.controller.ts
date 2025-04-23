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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { FindNearestUsersDTO } from './dto/find-nearest-users.dto';
import { UserDto } from '../user/dto/user-dto';
import { UserService } from '../user/user.service';
import { Response } from 'express';
import { AuthorizedUserDTO } from '../auth/dto/authorized-user.dto';
import { AuthorizedUser } from '../decorators/authorized-user.decorator';
import CreateMatchDTO from './dto/create-match.dto';
import { MatchService } from './match.service';
import MatchDTO from './dto/match.dto';
import AcceptMatchDTO from './dto/accept-match.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('match')
export class MatchController {
  constructor(
    private readonly userService: UserService,
    private readonly matchService: MatchService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns list of unaccepted matches',
  })
  @ApiOperation({
    summary: 'Get unaccepted matches',
    description: 'Get unaccepted matches for the user',
  })
  @Get('unaccepted')
  async getMatchesForUser(@AuthorizedUser() user: AuthorizedUserDTO) {
    return await this.matchService.getUnacceptedMatchesForUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a match between the user and the specified user',
    description: 'Provide liked userId to create match',
  })
  @ApiCreatedResponse({
    description: 'Match created successfully',
  })
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @Get('accepted')
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
  @UseGuards(JwtAuthGuard)
  @Post('accepted')
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
  @UseGuards(JwtAuthGuard)
  @Get('find')
  async searchNearestUsers(
    @Query(new ValidationPipe()) query: FindNearestUsersDTO,
    @AuthorizedUser() user: AuthorizedUserDTO,
    @Res() res: Response,
  ) {
    let seen: number[];
    if (query.seen === undefined) {
      seen = [];
    } else if (query.seen === null) {
      seen = [];
    } else {
      if (Array.isArray(query.seen)) {
        seen = query.seen.map((id) => +id);
      } else {
        seen = [+query.seen];
      }
    }
    res.send(
      await this.userService.findNearestUsersByUserId({
        userId: user.id,
        limit: query.limit,
        seen: seen,
      }),
    );
  }
}
