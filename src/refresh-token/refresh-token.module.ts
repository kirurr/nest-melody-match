import { Module } from '@nestjs/common';
import { RefreshTokenRepository } from './refresh-token.repository';
import { PrismaService } from '../prisma.service';
import { RefreshTokenService } from './refresh-token.service';
import { CryptoService } from './crypto-service';

@Module({
  providers: [
    RefreshTokenRepository,
    PrismaService,
    RefreshTokenService,
    CryptoService,
  ],
	exports: [RefreshTokenService],
})
export class RefreshTokenModule {}
