import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { GoogleAuthDTO } from './dto/google-auth.dto';
import { GetNewTokensPairByRefreshTokenDTO } from './dto/get-new-tokens-pair-by-refresh-token.dto';
import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    googleAuth: jest.fn(),
    getNewTokensPairByRefreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('googleRedirect', () => {
    const target = new ValidationPipe();
    const metadata: ArgumentMetadata = {
      type: 'query',
      metatype: GoogleAuthDTO,
      data: '',
    };

    it('should throw an BadRequestException if code is wrong type', async () => {
      await expect(
        async () => await target.transform({ code: 1 }, metadata),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an BadRequestException if code is empty', async () => {
      await expect(
        async () => await target.transform({ code: '' }, metadata),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call authService.googleAuth and return the response', async () => {
      const query = { code: 'auth-code' } as GoogleAuthDTO;
      const res = { send: jest.fn() } as unknown as Response;
      const expectedResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockAuthService.googleAuth.mockResolvedValue(expectedResponse);
      await authController.googleRedirect(query, res);

      expect(mockAuthService.googleAuth).toHaveBeenCalledWith('auth-code');
      expect(res.send).toHaveBeenCalledWith(expectedResponse);
    });
  });

  describe('getNewTokensPairByRefreshToken', () => {
    const target = new ValidationPipe();
    const metadata: ArgumentMetadata = {
      type: 'query',
      metatype: GetNewTokensPairByRefreshTokenDTO,
      data: '',
    };

    it('should throw an BadRequestException if refresh token is wrong type', async () => {
      await expect(
        async () => await target.transform({ refreshToken: 1 }, metadata),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an BadRequestException if refresh token is empty', async () => {
      await expect(
        async () => await target.transform({ refreshToken: '' }, metadata),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully return new pair of tokens', async () => {
      const res = { send: jest.fn() } as unknown as Response;
      const body: GetNewTokensPairByRefreshTokenDTO = {
        refreshToken: 'good-refresh-token',
      };
      const expectedResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockAuthService.getNewTokensPairByRefreshToken.mockResolvedValue(
        expectedResponse,
      );

      await authController.getNewTokensPairByRefreshToken(body, res);
      expect(
        mockAuthService.getNewTokensPairByRefreshToken,
      ).toHaveBeenCalledWith(body.refreshToken);
    });
  });
});
