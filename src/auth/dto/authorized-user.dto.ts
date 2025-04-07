import { IsNotEmpty, IsNumber } from 'class-validator';

export class AuthorizedUserDTO {
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
