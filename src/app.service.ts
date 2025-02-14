import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
	constructor(private readonly prismaService: PrismaService) {}
  getHello(string?: string): string {
    return string ?? 'Hello World!';
  }
	async getTest() {
		return await this.prismaService.test.findMany();
	}
}
