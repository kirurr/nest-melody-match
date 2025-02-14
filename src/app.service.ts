import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(string?: string): string {
    return string ?? 'Hello World!';
  }
}
