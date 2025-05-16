import { Module } from '@nestjs/common';
import { CryptoService } from '../refresh-token/crypto-service';
import { PrismaService } from 'src/prisma.service';
import { SpotifyService } from './spotify.service';
import { SpotifyRepository } from './spotify.repository';
import { SpotifyController } from './spotify.controller';
import { UserModule } from 'src/user/user.module';
import { GenreModule } from 'src/genre/genre.module';

@Module({
  providers: [PrismaService, CryptoService, SpotifyService, SpotifyRepository],
  exports: [SpotifyService],
  controllers: [SpotifyController],
	imports: [UserModule, GenreModule]
})
export class SpotifyModule {}
