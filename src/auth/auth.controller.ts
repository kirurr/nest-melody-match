import { Controller, Get, HttpException, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  async googleRedirect(@Req() req: Request, @Res() res: Response) {
    const { code, error } = req.query;

    if (error) throw new HttpException('Google auth error', 400);
    if (!code) throw new HttpException('No auth code provided', 400);

    res.send(await this.authService.googleAuth(code.toString()));
  }
}
