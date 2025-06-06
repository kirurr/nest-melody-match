import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { Prisma, User, UserContact, UserData } from '@prisma/client';
import {
  CreateUserContacts,
  CreateUserPreferences,
  FindNearestUsers,
  UpdateUserContacts,
  UpdateUserData,
  UpdateUserPreferences,
} from './user.types';
import { UserDto } from './dto/user-dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async deleteUser(id: number): Promise<void> {
    return await this.userRepository.deleteUser(id);
  }

  async getUser(id: number): Promise<UserDto | null> {
    return await this.userRepository.getUser(id);
  }

  async getMatchedUser(
    targetId: number,
    userId: number,
  ): Promise<UserDto | null> {
    return await this.userRepository.getMatchedUser(targetId, userId);
  }

  async findUserById(id: number): Promise<User | null> {
    return await this.userRepository.findUserById(id);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findUserByEmail(email);
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return await this.userRepository.createUser(data);
  }

  async createUserData(data: Prisma.UserDataCreateInput): Promise<UserData> {
    return await this.userRepository.createUserData(data);
  }

  async createUserPreferences(data: CreateUserPreferences): Promise<void> {
    return await this.userRepository.createUserPreferences(data);
  }

  async updateUserPreferences(data: UpdateUserPreferences): Promise<void> {
    return await this.userRepository.updateUserPreferences(data);
  }

  async findNearestUsersByUserId(data: FindNearestUsers): Promise<User[]> {
    const user = await this.userRepository.getUser(data.userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (!user.userPreferences) {
      throw new BadRequestException(
        'User preferences not found, you need to create one first',
      );
    }
    if (!user.userData) {
      throw new BadRequestException(
        'User data not found, you need to create one first',
      );
    }
    return await this.userRepository.findNearestUsersByUserId(data);
  }

  async updateUserData(data: UpdateUserData): Promise<void> {
    return await this.userRepository.updateUserData(data);
  }

  async createUserContacts(
    data: CreateUserContacts,
    userId: number,
  ): Promise<void> {
    return await this.userRepository.createUserContacts(data, userId);
  }

  async updateUserContacts(
    data: UpdateUserContacts,
    userId: number,
  ): Promise<void> {
    const user = await this.userRepository.getMatchedUser(userId, userId);
    if (!user) throw new BadRequestException('User not found');

    const contactsForDeletion: UserContact[] = [];

    user?.userData?.contacts?.forEach((contact) => {
      if (data.find((e) => (e.id == contact.id)) == undefined)
        contactsForDeletion.push(contact);
    });

    await Promise.all(
      contactsForDeletion.map((contact) =>
        this.userRepository.deleteUserContact(contact.id),
      ),
    );

    await Promise.all(
      data.map(async (contact) => {
        if (!contact.id) {
          return await this.userRepository.createUserContacts(
            [contact as UserContact],
            userId,
          );
        }
        // await this.userRepository.updateUserContact(contact);
      }),
    );
  }
}
