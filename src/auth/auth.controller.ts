import {
  Controller,
  Get,
  Query,
  Res,
  Body,
  ValidationPipe,
  Post,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { GetNewTokensPairByRefreshTokenDTO } from './dto/get-new-tokens-pair-by-refresh-token.dto';
import { GoogleAuthDTO } from './dto/google-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  async googleRedirect(
    @Query(new ValidationPipe()) query: GoogleAuthDTO,
    @Res() res: Response,
  ) {
    res.send(await this.authService.googleAuth(query.code));
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
