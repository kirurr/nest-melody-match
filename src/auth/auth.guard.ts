import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from 'src/jwt/jwt.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization as string | null;

    if (!authHeader) {
      throw new BadRequestException('No authorization header');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new BadRequestException('No token');
    }

    try {
      const payload = await this.jwtService.verifyAccessToken(token);
      request.userId = payload.userId;

      return true;
    } catch (e) {
      throw new UnauthorizedException('Token is invalid or expired, generate new');
    }
  }
}
