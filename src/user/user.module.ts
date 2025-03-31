import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { PrismaService } from '../prisma.service';
import { UserController } from './user.controller';
import { CustomJwtModule } from '../jwt/jwt.module';

@Module({
	imports: [
		CustomJwtModule,
	],
  providers: [UserService, UserRepository, PrismaService],
	exports: [UserService],
	controllers: [UserController]
})
export class UserModule {}
