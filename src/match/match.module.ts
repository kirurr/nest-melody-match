import { Module } from '@nestjs/common';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import { UserModule } from '../user/user.module';
import { MatchRepository } from './match.repository';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [MatchController],
  imports: [UserModule],
  providers: [MatchService, MatchRepository, PrismaService],
  exports: [MatchService],
})
export class MatchModule {}
