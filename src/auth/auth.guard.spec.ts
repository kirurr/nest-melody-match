import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtService } from '../jwt/jwt.service';
import {
  BadRequestException,
  UnauthorizedException,
  ExecutionContext,
} from '@nestjs/common';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let jwtService: JwtService;

  const mockJwtService = {
    verifyAccessToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should throw BadRequestException if no authorization header is present', async () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {},
          }),
        }),
      } as ExecutionContext;

      await expect(authGuard.canActivate(context)).rejects.toThrow(
        new BadRequestException('No authorization header'),
      );
    });

    it('should throw BadRequestException if no token is present', async () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'Bearer ',
            },
          }),
        }),
      } as ExecutionContext;

      await expect(authGuard.canActivate(context)).rejects.toThrow(
        new BadRequestException('No token'),
      );
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'Bearer valid-token',
            },
          }),
        }),
      } as ExecutionContext;

      mockJwtService.verifyAccessToken.mockRejectedValue(
        new Error('Invalid token'),
      );

      await expect(authGuard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('Token is invalid or expired, generate new'),
      );
    });

    it('should return true if token is valid', async () => {
      const userId = 1;
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'Bearer valid-token',
            },
          }),
        }),
      } as ExecutionContext;

      mockJwtService.verifyAccessToken.mockResolvedValue({ userId });

      const result = await authGuard.canActivate(context);
      expect(result).toBe(true);
    });
  });
});
