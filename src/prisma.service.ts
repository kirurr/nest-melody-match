import { createClient } from '@libsql/client';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(configService: ConfigService) {
    const libsql = createClient({
      url: configService.get<string>('TURSO_DATABASE_URL')!,
      authToken: configService.get<string>('TURSO_AUTH_TOKEN'),
    });

    const adapter = new PrismaLibSQL(libsql);

    super({ adapter });
  }
  async onModuleInit() {
    await this.$connect();
  }
}
