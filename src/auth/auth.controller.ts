import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleUser } from './auth.types';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { TokensPairDTO } from './dto/tokens-pair.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  @ApiOkResponse({
    description: 'User is authorized, returns access and refresh tokens',
    type: TokensPairDTO
  })
  @ApiCreatedResponse({
    description: 'New User is created, returns access and refresh tokens',
    type: TokensPairDTO
  })
  async googleAuthRedirect(
    @Req() req: Request & { user: GoogleUser },
    @Res() res: Response,
  ) {
    const { accessToken: access_token, refreshToken: refresh_token, isNewUser } =
      await this.authService.handleOAuth(req.user);
    if (isNewUser) res.send({ access_token, refresh_token });
    else res.status(201).send({ access_token, refresh_token });
  }
}
