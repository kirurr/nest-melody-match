import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

@Injectable()
export class CryptoService {
  private readonly secretKey: Buffer;
  private readonly algorithm = 'aes-256-cbc';
  private readonly iv: Buffer;

  constructor(configService: ConfigService) {
    const secretKey = configService.get<string>('REFRESH_SECRET');
    if (!secretKey) {
      throw new Error('REFRESH_SECRET env variable is not set');
    }

    this.secretKey = Buffer.from(secretKey, 'hex');

    this.iv = randomBytes(16);
  }

  async encryptRefreshToken(token: string): Promise<string> {
    const cipher = createCipheriv(this.algorithm, this.secretKey, this.iv);
    const encrypted = cipher.update(token, 'utf8', 'hex');
    return `${this.iv.toString('hex')}:${encrypted}${cipher.final('hex')}`;
  }

  async decryptRefreshToken(token: string): Promise<string> {
    const [iv, encrypted] = token.split(':');
    const decipher = createDecipheriv(
      this.algorithm,
      this.secretKey,
      Buffer.from(iv, 'hex'),
    );
    const decrypted = decipher.update(encrypted, 'hex', 'utf8');
    return decrypted + decipher.final('utf8');
  }
}
