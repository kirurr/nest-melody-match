import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { GoogleAuthModule } from './google-auth/google-auth.module';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { PrismaService } from '../prisma.service';
import { CustomJwtModule } from '../jwt/jwt.module';
import { RefreshTokenModule } from '../refresh-token/refresh-token.module';

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
