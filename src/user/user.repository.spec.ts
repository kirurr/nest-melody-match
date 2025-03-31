import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { PrismaService } from '../prisma.service';
import { User } from '@prisma/client';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  describe('findUserById', () => {
    it('should return a user if found', async () => {
      const userId = 1;
      const user: User = { id: userId, email: 'test@example.com', name: 'Test User' } as User;
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await userRepository.findUserById(userId);
      expect(result).toEqual(user);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should return null if user not found', async () => {
      const userId = 1;
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await userRepository.findUserById(userId);
      expect(result).toBeNull();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });

  describe('findUserByEmail', () => {
    it('should return a user if found', async () => {
      const email = 'test@example.com';
      const user: User = { id: 1, email, name: 'Test User' } as User;
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await userRepository.findUserByEmail(email);
      expect(result).toEqual(user);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
    });

    it('should return null if user not found', async () => {
      const email = 'test@example.com';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await userRepository.findUserByEmail(email);
      expect(result).toBeNull();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
    });
  });

  describe('createUser', () => {
    it('should create and return a user', async () => {
      const userData = { email: 'test@example.com', name: 'Test User' };
      const createdUser: User = { id: 1, ...userData } as User;
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await userRepository.createUser(userData);
      expect(result).toEqual(createdUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: userData,
      });
    });
  });
});

