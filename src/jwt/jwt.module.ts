import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  providers: [JwtService],
	exports: [JwtService],
  imports: [
    JwtModule.registerAsync({
			imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
			inject: [ConfigService]
    }),
  ],
})
export class CustomJwtModule {}
