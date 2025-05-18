import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RefreshTokenModule } from './refresh-token/refresh-token.module';
import { GenreModule } from './genre/genre.module';
import { MatchModule } from './match/match.module';
import { SpotifyModule } from './spotify/spotify.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    SpotifyModule,
    RefreshTokenModule,
    GenreModule,
    MatchModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
