import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';
import { RefreshTokenModule } from 'src/refresh-token/refresh-token.module';
import { UserModule } from 'src/user/user.module';
import { SpotifyStrategy } from './strategies/spotify.strategy';
import { SpotifyModule } from 'src/spotify/spotify.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    RefreshTokenModule,
    SpotifyModule,
    UserModule
  ],
  controllers: [AuthController],
  providers: [GoogleStrategy, JwtStrategy, AuthService, SpotifyStrategy],
})
export class AuthModule {}
