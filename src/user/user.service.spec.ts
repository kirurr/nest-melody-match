import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { Prisma, User } from '@prisma/client';

describe('UserService', () => {
  let userService: UserService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userRepository: UserRepository;

  const mockUserRepository = {
    findUserById: jest.fn(),
    findUserByEmail: jest.fn(),
    createUser: jest.fn(),
    createUserPreferences: jest.fn(),
    findNearestUsersByUserId: jest.fn(),
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
      mockUserRepository.findUserById.mockResolvedValue(mockUser);

      const result = await userService.findUserById(userId);
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findUserById).toHaveBeenCalledWith(userId);
    });

    it('should return null if user not found', async () => {
      const userId = 1;
      mockUserRepository.findUserById.mockResolvedValue(null);

      const result = await userService.findUserById(userId);
      expect(result).toBeNull();
      expect(mockUserRepository.findUserById).toHaveBeenCalledWith(userId);
    });
  });

  describe('findUserByEmail', () => {
    it('should return a user if found', async () => {
      const email = 'test@example.com';
      const mockUser: User = { id: 1, email, name: 'Test User' } as User;
      mockUserRepository.findUserByEmail.mockResolvedValue(mockUser);

      const result = await userService.findUserByEmail(email);
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findUserByEmail).toHaveBeenCalledWith(email);
    });

    it('should return null if user not found', async () => {
      const email = 'test@example.com';
      mockUserRepository.findUserByEmail.mockResolvedValue(null);

      const result = await userService.findUserByEmail(email);
      expect(result).toBeNull();
      expect(mockUserRepository.findUserByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('createUser', () => {
    it('should create and return a user', async () => {
      const userData: Prisma.UserCreateInput = {
        email: 'test@example.com',
        name: 'Test User',
      };
      const mockUser: User = { id: 1, ...userData } as User;
      mockUserRepository.createUser.mockResolvedValue(mockUser);

      const result = await userService.createUser(userData);
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.createUser).toHaveBeenCalledWith(userData);
    });
  });

  describe('createUserPreferences', () => {
    it('should call userRepository.createUserPreferences with correct data', async () => {
      const data = {
        userId: 1,
        genresVector: [1, 0, 0, 0, 0],
        desiredSex: 'MALE' as 'MALE' | 'FEMALE',
      };

      mockUserRepository.createUserPreferences = jest
        .fn()
        .mockResolvedValue(undefined);

      await userService.createUserPreferences(data); 

      expect(mockUserRepository.createUserPreferences).toHaveBeenCalledWith(
        data,
      ); 
    });
  });
  describe('findNearestUsersByUserId', () => {
    it('should call userRepository.findNearestUsersByUserId with correct parameters', async () => {
      const userId = 1;
      const limit = 5;
      const mockUsers: User[] = [
        { id: 2, email: 'user2@example.com', name: 'User 2' } as User,
        { id: 3, email: 'user3@example.com', name: 'User 3' } as User,
      ];
  
      mockUserRepository.findNearestUsersByUserId = jest.fn().mockResolvedValue(mockUsers);
  
      const result = await userService.findNearestUsersByUserId(userId, limit);
  
      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.findNearestUsersByUserId).toHaveBeenCalledWith(userId, limit);
    });
  
    it('should return an empty array if no users are found', async () => {
      const userId = 1;
      const limit = 5;
  
      mockUserRepository.findNearestUsersByUserId = jest.fn().mockResolvedValue([]);
  
      const result = await userService.findNearestUsersByUserId(userId, limit);
  
      expect(result).toEqual([]);
      expect(mockUserRepository.findNearestUsersByUserId).toHaveBeenCalledWith(userId, limit);
    });
  });
});
