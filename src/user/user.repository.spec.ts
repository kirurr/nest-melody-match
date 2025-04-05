import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { PrismaService } from '../prisma.service';
import { User } from '@prisma/client';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let prismaService: PrismaService;

  const mockPrismaService = {
    $executeRaw: jest.fn(),
    $queryRaw: jest.fn(),
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
      const user: User = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
      } as User;
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

  describe('createUserPreferences', () => {
    it('should insert user preferences into the database', async () => {
      const data = {
        userId: 1,
        genresVector: [1, 0, 0, 0, 0],
        desiredSex: 'MALE' as 'MALE' | 'FEMALE',
      };

      mockPrismaService.$executeRaw.mockResolvedValue(undefined); // Предполагаем, что метод ничего не возвращает

      await userRepository.createUserPreferences(data);

      expect(mockPrismaService.$executeRaw).toHaveBeenCalledWith(
        expect.any(Array),
        data.userId,
        data.genresVector,
        data.desiredSex,
      );
    });
  });
  describe('findNearestUsersByUserId', () => {
    it('should return nearest users based on genres vector', async () => {
      const userId = 1;
      const limit = 5;
      const mockUsers: User[] = [
        { id: 2, email: 'user2@example.com', name: 'User 2' } as User,
        { id: 3, email: 'user3@example.com', name: 'User 3' } as User,
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(mockUsers);

      const result = await userRepository.findNearestUsersByUserId(
        userId,
        limit,
      );

      expect(result).toEqual(mockUsers);
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledWith(
        expect.any(Array),
        userId,
        userId,
        limit,
      );
    });

    it('should return an empty array if no users are found', async () => {
      const userId = 1;
      const limit = 5;

      mockPrismaService.$queryRaw.mockResolvedValue([]);

      const result = await userRepository.findNearestUsersByUserId(
        userId,
        limit,
      );

      expect(result).toEqual([]);
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledWith(
        expect.any(Array),
        userId,
        userId,
        limit,
      );
    });
  });
});
