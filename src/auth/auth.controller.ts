import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleUser } from './auth.types';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { TokensPairDTO } from './dto/tokens-pair.dto';
import { RefreshTokenDTO } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  @ApiOkResponse({
    description: 'User is authorized, returns access and refresh tokens',
    type: TokensPairDTO,
  })
  @ApiCreatedResponse({
    description: 'New User is created, returns access and refresh tokens',
    type: TokensPairDTO,
  })
  async googleAuthRedirect(
    @Req() req: Request & { user: GoogleUser },
    @Res() res: Response,
  ) {
    const {
      accessToken: access_token,
      refreshToken: refresh_token,
      isNewUser,
    } = await this.authService.handleOAuth(req.user);
    if (isNewUser) res.send({ access_token, refresh_token });
    else res.status(201).send({ access_token, refresh_token });
  }

  @Get('refresh')
  @ApiOkResponse({
    description:
      'Refresh token is valid, returns new access and refresh tokens',
    type: TokensPairDTO,
  })
  @ApiBadRequestResponse({
    description: 'Refresh token is invalid',
  })
  async refreshToken(
    @Body(new ValidationPipe()) body: RefreshTokenDTO,
    @Res() res: Response,
  ) {
    const result = await this.authService.hanleRefreshToken(body.refreshToken);
    if (!result) throw new BadRequestException('Invalid refresh token');
    res.send(result);
  }
}
