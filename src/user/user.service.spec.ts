import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { Prisma, User } from '@prisma/client';
import { UserDto } from './dto/user-dto';
import {
  CreateUserPreferences,
  UpdateUserData,
  UpdateUserPreferences,
} from './user.types';
import { BadRequestException } from '@nestjs/common';

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
    updateUserData: jest.fn(),
    getUser: jest.fn(),
    deleteUser: jest.fn(),
    updateUserPreferences: jest.fn(),
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

  describe('getUser', () => {
    it('should return a user if found', async () => {
      const userId = 1;
      const mockUser: UserDto = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
        userData: null,
        userPreferences: null,
      };
      mockUserRepository.getUser.mockResolvedValue(mockUser);

      const result = await userService.getUser(userId);
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.getUser).toHaveBeenCalledWith(userId);
    });

    it('should return null if user not found', async () => {
      const userId = 1;
      mockUserRepository.getUser.mockResolvedValue(null);

      const result = await userService.getUser(userId);
      expect(result).toBeNull();
      expect(mockUserRepository.getUser).toHaveBeenCalledWith(userId);
    });
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

  describe('updateUserData', () => {
    it('should call userRepository.updateUserData with correct data', async () => {
      const data: UpdateUserData = {
        userId: 1,
        age: 54,
        sex: 'MALE',
        displayName: 'Glad Valakas',
      };

      mockUserRepository.updateUserData.mockResolvedValue(undefined);

      await userService.updateUserData(data);

      expect(mockUserRepository.updateUserData).toHaveBeenCalledWith(data);
    });
  });
  describe('deleteUser', () => {
    it('should call userRepository.deleteUser with correct data', async () => {
      const userId = 1;

      const result = await userService.deleteUser(userId);

      expect(result).toBeUndefined();
      expect(mockUserRepository.deleteUser).toHaveBeenCalledWith(userId);
    });
  });
  describe('updateUserPreferences', () => {
    it('should call userRepository.updateUserPreferences with correct data', async () => {
      const data: UpdateUserPreferences = {
        userId: 1,
        genresVector: [1, 0, 0, 0, 0],
        desiredSex: 'MALE',
        genresIds: [1, 2, 3],
      };

      const result = await userService.updateUserPreferences(data);

      expect(result).toBeUndefined();
      expect(mockUserRepository.updateUserPreferences).toHaveBeenCalledWith(
        data,
      );
    });
  });
  describe('createUserPreferences', () => {
    it('should call userRepository.createUserPreferences with correct data', async () => {
      const data = {
        userId: 1,
        genresVector: [1, 0, 0, 0, 0],
        desiredSex: 'MALE' as 'MALE' | 'FEMALE',
        genresIds: [1, 2, 3],
      } as CreateUserPreferences;

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
      const seen = [1, 2, 3];
      const mockUsers: User[] = [
        { id: 2, email: 'user2@example.com', name: 'User 2' } as User,
        { id: 3, email: 'user3@example.com', name: 'User 3' } as User,
      ];
      const user: UserDto = {
        id: 1,
        userData: { id: 1 },
        userPreferences: { id: 1 },
      } as UserDto;
      mockUserRepository.getUser.mockResolvedValue(user);

      mockUserRepository.findNearestUsersByUserId = jest
        .fn()
        .mockResolvedValue(mockUsers);

      const result = await userService.findNearestUsersByUserId({
        userId,
        limit,
        seen,
      });

      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.findNearestUsersByUserId).toHaveBeenCalledWith({
        userId,
        limit,
        seen,
      });
    });

    it('should not return a user', async () => {
      const userId = 1;
      const limit = 5;
      const seen = [1, 2, 3];
      mockUserRepository.getUser.mockResolvedValue(undefined);

      await expect(
        userService.findNearestUsersByUserId({
          userId,
          limit,
          seen,
        }),
      ).rejects.toThrow(new BadRequestException('User not found'));
    });

    it('should return a user without userPreferences', async () => {
      const userId = 1;
      const limit = 5;
      const seen = [1, 2, 3];

      const user: UserDto = {
        id: 1,
        userData: { id: 1 },
      } as UserDto;
      mockUserRepository.getUser.mockResolvedValue(user);

      await expect(
        userService.findNearestUsersByUserId({
          userId,
          limit,
          seen,
        }),
      ).rejects.toThrow(
        new BadRequestException(
          'User preferences not found, you need to create one first',
        ),
      );
    });
    it('should return a user without userData', async () => {
      const userId = 1;
      const limit = 5;
      const seen = [1, 2, 3];

      const user: UserDto = {
        id: 1,
        userPreferences: { id: 1 },
      } as UserDto;
      mockUserRepository.getUser.mockResolvedValue(user);

      await expect(
        userService.findNearestUsersByUserId({
          userId,
          limit,
          seen,
        }),
      ).rejects.toThrow(
        new BadRequestException(
          'User data not found, you need to create one first',
        ),
      );
    });

    it('should return an empty array if no users are found', async () => {
      const userId = 1;
      const limit = 5;
      const seen = [1, 2, 3];

      const user: UserDto = {
        id: 1,
        userData: { id: 1 },
        userPreferences: { id: 1 },
      } as UserDto;
      mockUserRepository.getUser.mockResolvedValue(user);

      mockUserRepository.findNearestUsersByUserId = jest
        .fn()
        .mockResolvedValue([]);

      const result = await userService.findNearestUsersByUserId({
        userId,
        limit,
        seen,
      });

      expect(result).toEqual([]);
      expect(mockUserRepository.findNearestUsersByUserId).toHaveBeenCalledWith({
        userId,
        limit,
        seen,
      });
    });
  });
});
