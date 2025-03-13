import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { GoogleAuthModule } from './google-auth/google-auth.module';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { PrismaService } from 'src/prisma.service';
import { CustomJwtModule } from 'src/jwt/jwt.module';
import { RefreshTokenModule } from 'src/refresh-token/refresh-token.module';

@Module({
  imports: [
		CustomJwtModule,
    GoogleAuthModule,
		UserModule,
		RefreshTokenModule
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
})
export class AuthModule {}
