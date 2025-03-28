import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { Prisma, User } from '@prisma/client';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;

  const mockUserRepository = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('findUserById', () => {
    it('should return a user if found', async () => {
      const userId = 1;
      const mockUser: User = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
      } as User;
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.findUserById(userId);
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should return null if user not found', async () => {
      const userId = 1;
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await userService.findUserById(userId);
      expect(result).toBeNull();
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('findUserByEmail', () => {
    it('should return a user if found', async () => {
      const email = 'test@example.com';
      const mockUser: User = { id: 1, email, name: 'Test User' } as User;
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await userService.findUserByEmail(email);
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should return null if user not found', async () => {
      const email = 'test@example.com';
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await userService.findUserByEmail(email);
      expect(result).toBeNull();
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('createUser', () => {
    it('should create and return a user', async () => {
      const userData: Prisma.UserCreateInput = {
        email: 'test@example.com',
        name: 'Test User',
      };
      const mockUser: User = { id: 1, ...userData } as User;
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await userService.createUser(userData);
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
    });
  });
});
