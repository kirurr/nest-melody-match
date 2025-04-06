import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleUser } from './auth.types';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Этот маршрут перенаправляет пользователя на страницу входа в Google
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: Request & { user: GoogleUser },
    @Res() res: Response,
  ) {
    const { access_token, refresh_token, isNewUser } =
      await this.authService.handleOAuth(req.user);
    if (isNewUser) res.send({ access_token, refresh_token });
    else res.status(201).send({ access_token, refresh_token });
  }
}
