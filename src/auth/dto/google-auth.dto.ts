import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleAuthDTO {
  @IsString()
  @IsNotEmpty()
  code: string;
}
