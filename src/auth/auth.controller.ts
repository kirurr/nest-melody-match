import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleUser, SpotifyUser } from './auth.types';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTemporaryRedirectResponse,
} from '@nestjs/swagger';
import { TokensPairDTO } from './dto/tokens-pair.dto';
import { RefreshTokenDTO } from './dto/refresh-token.dto';
import { SpotifyTokenPairDTO } from './dto/spotify-token-pair.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('android/spotify/redirect')
  @UseGuards(AuthGuard('spotify-android'))
  @ApiOperation({
    summary: 'Redirect to Spotify for authorization',
    description:
      'Redirect to Spotify for authorization and retireve tokens pair',
  })
  @ApiTemporaryRedirectResponse({
    description:
      'User is authorized, redirect with access, refresh tokens and spotify access token',
  })
  async spotifyAndroidAuthRedirect(
    @Req() req: Request & { user: SpotifyUser },
    @Res() res: Response,
  ) {
    const {
      accessToken,
      refreshToken,
      spotifyAccessToken,
      spotifyRefreshToken,
    } = await this.authService.handleSpotifyOAuth(req.user);
    res.redirect(
      `myapp://callback?access_token=${accessToken}&refresh_token=${refreshToken}&spotify_access_token=${spotifyAccessToken}&spotify_refresh_token=${spotifyRefreshToken}`,
    );
  }

  @Get('spotify/redirect')
  @UseGuards(AuthGuard('spotify'))
  @ApiOperation({
    summary: 'Redirect to Spotify for authorization',
    description:
      'Redirect to Spotify for authorization and retireve tokens pair',
  })
  @ApiOkResponse({
    description: 'User is authorized, returns access and refresh tokens',
    type: SpotifyTokenPairDTO,
  })
  @ApiCreatedResponse({
    description: 'New User is created, returns access and refresh tokens',
    type: SpotifyTokenPairDTO,
  })
  async spotifyAuthRedirect(
    @Req() req: Request & { user: SpotifyUser },
    @Res() res: Response,
  ) {
    const {
      accessToken,
      refreshToken,
      spotifyAccessToken,
      isNewUser,
      spotifyRefreshToken,
    } = await this.authService.handleSpotifyOAuth(req.user);
    if (isNewUser)
      res.send({
        accessToken,
        refreshToken,
        spotifyAccessToken,
        spotifyRefreshToken,
      });
    else
      res
        .status(201)
        .send({
          accessToken,
          refreshToken,
          spotifyAccessToken,
          spotifyRefreshToken,
        });
  }

  @Get('google/redirect')
  @ApiOperation({
    summary: 'Redirect to Google for authorization',
    description:
      'Redirect to Google for authorization and retireve tokens pair',
  })
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
    const { accessToken, refreshToken, isNewUser } =
      await this.authService.handleGoogleOAuth(req.user);
    if (isNewUser) res.send({ accessToken, refreshToken });
    else res.status(201).send({ accessToken, refreshToken });
  }

  @Get('android/google/redirect')
  @ApiOperation({
    summary: 'Redirect to Google for authorization',
    description:
      'Redirect to Google for authorization and retireve tokens pair',
  })
  @UseGuards(AuthGuard('google-android'))
  @ApiTemporaryRedirectResponse({
    description: 'User is authorized, redirect with access and refresh tokens',
  })
  async androidAuthGoogleRedirect(
    @Req() req: Request & { user: GoogleUser },
    @Res() res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.handleGoogleOAuth(req.user);
    res.redirect(
      `myapp://callback?access_token=${accessToken}&refresh_token=${refreshToken}`,
    );
  }

  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Refresh access token by providing valid refresh token',
  })
  @Post('refresh')
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
