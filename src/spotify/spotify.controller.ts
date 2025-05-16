import { Body, Controller, Post, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthorizedUserDTO } from 'src/auth/dto/authorized-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthorizedUser } from 'src/decorators/authorized-user.decorator';
import { SpotifyService } from './spotify.service';
import { Response } from 'express';
import { SpotifyAccessTokenDTO } from './dto/spotify-access-token.dto';

@Controller('spotify')
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

  @ApiBearerAuth()
	@ApiCreatedResponse({
		description: 'Successfully asigned genres from Spotify to user',
	})
	@ApiUnauthorizedResponse({
		description: "User's refresh token is invalid, try to sign in to spotify again",
	})
	@ApiOperation({
		summary: 'Assign genres from Spotify to user',
	})
  @UseGuards(JwtAuthGuard)
  @Post('user')
  async asignSpotifyGenresToUser(
    @AuthorizedUser() user: AuthorizedUserDTO,
		@Body(new ValidationPipe()) body: SpotifyAccessTokenDTO,
    @Res() res: Response,
  ) {
    await this.spotifyService.asignSpotifyGenresToUser(user.id, body.accessToken);
    res.sendStatus(201);
  }
}
