import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { CustomJwtModule } from './jwt/jwt.module';
import { UserModule } from './user/user.module';
import { RefreshTokenModule } from './refresh-token/refresh-token.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    CustomJwtModule,
    UserModule,
    RefreshTokenModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
