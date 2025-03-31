import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserDataDTO } from './dto/create-user-data.dto';
import { UserService } from './user.service';
import { Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AuthorizedUserId } from '../decorators/authorized-user-id.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Post('data')
  async createUserData(
    @Body(new ValidationPipe()) data: CreateUserDataDTO,
    @Res() res: Response,
    @AuthorizedUserId() userId: number
  ) {
    try {
      await this.userService.createUserData({
        age: data.age,
        sex: data.sex,
        displayName: data.displayName,
        user: { connect: { id: userId } },
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException('UserData for that user already exists');
      } else {
        throw e;
      }
    }

    res.sendStatus(201);
  }
}
