import { IsNotEmpty, IsString } from 'class-validator';

export class GetNewTokensPairByRefreshTokenDTO {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
