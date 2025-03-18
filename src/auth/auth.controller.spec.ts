import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    googleAuth: jest.fn(),
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
    it('should throw an HttpException if there is an error in the query', async () => {
      const req = { query: { error: 'some error' } } as unknown as Request;
      const res = {} as Response;

      await expect(authController.googleRedirect(req, res)).rejects.toThrow(
        new HttpException('Google auth error', 400),
      );
    });

    it('should throw an HttpException if no auth code is provided', async () => {
      const req = { query: {} } as Request;
      const res = {} as Response;

      await expect(authController.googleRedirect(req, res)).rejects.toThrow(
        new HttpException('No auth code provided', 400),
      );
    });

    it('should call authService.googleAuth and return the response', async () => {
      const req = { query: { code: 'auth-code' } } as unknown as Request;
      const res = { send: jest.fn() } as unknown as Response;
      const expectedResponse = { accessToken: 'access-token', refreshToken: 'refresh-token' };

      mockAuthService.googleAuth.mockResolvedValue(expectedResponse);

      await authController.googleRedirect(req, res);

      expect(mockAuthService.googleAuth).toHaveBeenCalledWith('auth-code');
      expect(res.send).toHaveBeenCalledWith(expectedResponse);
    });
  });
});
