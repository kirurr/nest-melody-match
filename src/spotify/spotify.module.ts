import { Module } from '@nestjs/common';
import { CryptoService } from '../refresh-token/crypto-service';
import { PrismaService } from 'src/prisma.service';
import { SpotifyService } from './spotify.service';
import { SpotifyRepository } from './spotify.repository';
import { SpotifyController } from './spotify.controller';

@Module({
  providers: [PrismaService, CryptoService, SpotifyService, SpotifyRepository],
  exports: [SpotifyService],
  controllers: [SpotifyController],
})
export class SpotifyModule {}
