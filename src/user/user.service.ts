import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { Prisma, User, UserData } from '@prisma/client';
import { CreateUserPreferences, FindNearestUsers, UpdateUserData, UpdateUserPreferences } from './user.types';
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
    return await this.userRepository.createUserData(data)
  }

  async createUserPreferences(data: CreateUserPreferences): Promise<void> {
    return await this.userRepository.createUserPreferences(data);
  }

  async updateUserPreferences(data: UpdateUserPreferences): Promise<void> {
    return await this.userRepository.updateUserPreferences(data);
  }

  async findNearestUsersByUserId(data: FindNearestUsers): Promise<User[]> {
    return await this.userRepository.findNearestUsersByUserId(data);
  }

  async updateUserData(data: UpdateUserData): Promise<void> {
    return await this.userRepository.updateUserData(data);
  }
}
