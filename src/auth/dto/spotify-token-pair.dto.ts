import { IsNotEmpty, IsString } from 'class-validator';
import { TokensPairDTO } from './tokens-pair.dto';
import { ApiProperty } from '@nestjs/swagger';

export class SpotifyTokenPairDTO extends TokensPairDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  spotifyAccessToken: string;
}
