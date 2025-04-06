import {
  Controller,
  Query,
  Res,
  Body,
  ValidationPipe,
  Post,
  Get,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { GetNewTokensPairByRefreshTokenDTO } from './dto/get-new-tokens-pair-by-refresh-token.dto';
import { GoogleAuthDTO } from './dto/google-auth.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { TokensPairDTO } from './dto/tokens-pair.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google/redirect')
  @ApiOperation({ summary: 'Auth user with Google OAuth2' })
  @ApiOkResponse({
    type: TokensPairDTO,
    description: 'User is authorized, provided with tokens pair',
  })
  @ApiCreatedResponse({
    type: TokensPairDTO,
    description: 'User is created, provided with tokens pair',
  })
  @ApiBadRequestResponse({ description: 'Code is invalid or not provided' })
  async googleRedirect(
    @Query(new ValidationPipe()) query: GoogleAuthDTO,
    @Res() res: Response,
  ) {
    const [tokensPair, isNewUser] = await this.authService.googleAuth(
      query.code,
    );
    if (isNewUser) {
      res.status(201).send(tokensPair);
    } else {
      res.send(tokensPair);
    }
  }

  @Post('refresh-token')
  async getNewTokensPairByRefreshToken(
    @Body(new ValidationPipe()) body: GetNewTokensPairByRefreshTokenDTO,
    @Res() res: Response,
  ) {
    res.send(
      await this.authService.getNewTokensPairByRefreshToken(body.refreshToken),
    );
  }
}
