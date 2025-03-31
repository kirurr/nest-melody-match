import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { AuthorizedUserId } from './decorators/authorized-user-id.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test')
  async getTest() {
    return await this.appService.getTest();
  }

  @UseGuards(AuthGuard)
  @Get('guard')
  getGuard(@AuthorizedUserId() userId: number) {
    return userId;
  }
}
