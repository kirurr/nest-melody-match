import { Module } from '@nestjs/common';
import { GoogleAuthProvider } from './google-auth.provider';
import { GoogleAuthService } from './google-auth.service';

@Module({
	providers: [GoogleAuthProvider, GoogleAuthService],
	exports: [GoogleAuthService],
})
export class GoogleAuthModule {}
