import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { PrismaService } from '../prisma.service';
import { Prisma, User } from '@prisma/client';
import { UserDto } from './dto/user-dto';
import type {
  CreateUserPreferences,
  UpdateUserData,
  UpdateUserPreferences,
} from './user.types';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let prismaService: PrismaService;

  const mockPrismaService = {
    $executeRaw: jest.fn(),
    $queryRaw: jest.fn(),
    $transaction: jest.fn(),
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    activeRefreshToken: {
      delete: jest.fn(),
    },
    match: {
      deleteMany: jest.fn(),
    },
    userData: {
      update: jest.fn(),
      delete: jest.fn(),
    },
    userPreferences: {
      update: jest.fn(),
      delete: jest.fn(),
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

  describe('deleteUser', () => {
    it('should delete user, userData, userPreferences, activeRefreshToken and all matches with this user', async () => {
      const userId = 1;

      await userRepository.deleteUser(userId);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should call all delete methods with correct parameters', async () => {
      const userId = 1;
      await userRepository.deleteUser(userId);

      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockPrismaService.userData.delete).toHaveBeenCalledWith({
        where: { userId: userId },
      });
      expect(mockPrismaService.userPreferences.delete).toHaveBeenCalledWith({
        where: { userId: userId },
      });
      expect(mockPrismaService.activeRefreshToken.delete).toHaveBeenCalledWith({
        where: { userId: userId },
      });
      expect(mockPrismaService.match.deleteMany).toHaveBeenCalledWith({
        where: { OR: [{ likedUserId: userId }, { userId: userId }] },
      });
    });
  });

  describe('getUser', () => {
    it('should return a user if found', async () => {
      const id = 1;
      const user: UserDto = {
        id: id,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
        userData: null,
        userPreferences: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await userRepository.getUser(id);
      expect(result).toEqual(user);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: {
          userData: true,
          userPreferences: {
            include: {
              genres: true,
            },
          },
        },
      });
    });

    it('should return null if user not found', async () => {
      const id = 1;
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await userRepository.getUser(id);
      expect(result).toBeNull();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: {
          userData: true,
          userPreferences: {
            include: {
              genres: true,
            },
          },
        },
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

  describe('updateUserData', () => {
    it('should successfully update userData', async () => {
      const userData = {
        userId: 1,
        age: 54,
        sex: 'MALE',
        displayName: 'Glad Valakas',
      } as UpdateUserData;
      await userRepository.updateUserData(userData);
      expect(mockPrismaService.userData.update).toHaveBeenCalledWith({
        where: {
          userId: userData.userId,
        },
        data: {
          ...userData,
        },
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

  describe('updateUserPreferences', () => {
    it('should update user preferences', async () => {
      const data: UpdateUserPreferences = {
        userId: 1,
        genresIds: [1, 2, 3],
        genresVector: [1, 0, 0, 0, 0],
        desiredSex: 'MALE',
      };
      const updateString = Prisma.join([
        Prisma.sql`data = ${'data'}::data`,
        Prisma.sql`vector = ${[1, 2, 3]}::vector`,
      ]);

      const mockCreateUpdateUserPreferencesString = jest.spyOn(
        userRepository as any,
        'createUpdateUserPreferencesString',
      );
      mockCreateUpdateUserPreferencesString.mockReturnValue(updateString);

      await userRepository.updateUserPreferences(data);

      expect(mockCreateUpdateUserPreferencesString).toHaveBeenCalledWith(data);

      expect(mockPrismaService.$executeRaw).toHaveBeenCalledWith(
        expect.any(Array),
        updateString,
        data.userId,
      );

      expect(mockPrismaService.userPreferences.update).toHaveBeenCalledWith({
        where: {
          userId: data.userId,
        },
        data: {
          genres: {
            set: data.genresIds!.map((id) => ({ id })),
          },
        },
      });
    });
  });

  describe('createUserPreferences', () => {
    it('should insert user preferences into the database', async () => {
      const data: CreateUserPreferences = {
        userId: 1,
        genresIds: [1, 2, 3],
        genresVector: [1, 0, 0, 0, 0],
        desiredSex: 'MALE' as 'MALE' | 'FEMALE',
      };

      await userRepository.createUserPreferences(data);

      expect(mockPrismaService.$executeRaw).toHaveBeenCalledWith(
        expect.any(Array),
        data.userId,
        data.genresVector,
        data.desiredSex,
      );

      expect(mockPrismaService.userPreferences.update).toHaveBeenCalledWith({
        where: {
          userId: data.userId,
        },
        data: {
          genres: {
            set: data.genresIds.map((id) => ({ id })),
          },
        },
      });
    });
  });

  describe('findNearestUsersByUserId', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return nearest users based on genres vector', async () => {
      const userId = 1;
      const limit = 5;
      const seen = [1, 2, 3];
      const mockQueryUsers: User[] = [
        {
          id: 2,
          email: 'user2@example.com',
          name: 'User 2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          email: 'user3@example.com',
          name: 'User 3',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockResultUsers: UserDto[] = [
        {
          id: 2,
          email: 'user2@example.com',
          name: 'User 2',
          userData: null,
          userPreferences: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          email: 'user3@example.com',
          name: 'User 3',
          userData: null,
          userPreferences: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(mockQueryUsers);
      mockPrismaService.user.findMany.mockResolvedValue(mockResultUsers);

      const result = await userRepository.findNearestUsersByUserId({
        userId,
        limit,
        seen,
      });

      expect(result).toEqual(mockResultUsers);
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledWith(
        expect.any(Array),
        userId,
        userId,
        userId,
        Prisma.join(seen),
        limit,
      );

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: mockQueryUsers.map((user) => user.id),
          },
        },
        include: {
          userData: true,
          userPreferences: {
            include: {
              genres: true,
            },
          },
        },
      });
    });

    it('should return an empty array if no users are found', async () => {
      const userId = 1;
      const limit = 5;
      const seen = [1, 2, 3];

      mockPrismaService.$queryRaw.mockResolvedValue([]);

      const result = await userRepository.findNearestUsersByUserId({
        userId,
        limit,
        seen,
      });

      expect(result).toEqual([]);
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledWith(
        expect.any(Array),
        userId,
        userId,
        userId,
        Prisma.join(seen),
        limit,
      );
      expect(mockPrismaService.user.findMany).not.toHaveBeenCalled();
    });
  });
});
