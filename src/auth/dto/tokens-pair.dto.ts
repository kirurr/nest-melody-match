import { IsNotEmpty, IsString } from 'class-validator';

export class TokensPairDTO {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  @IsNotEmpty()
  @IsString()
  accessToken: string;
}
