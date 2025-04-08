import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { PreferencesSex, Prisma, User, UserData } from '@prisma/client';
import { FindNearestUsers } from './user.types';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

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

  async createUserPreferences(data: {
    userId: number;
    genresVector: number[];
    desiredSex: PreferencesSex;
  }): Promise<void> {
    return await this.userRepository.createUserPreferences(data);
  }

  async findNearestUsersByUserId(data: FindNearestUsers): Promise<User[]> {
    return await this.userRepository.findNearestUsersByUserId(data);
  }
}
