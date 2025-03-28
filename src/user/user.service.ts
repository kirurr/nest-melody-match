import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findUserById(id: number): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return await this.userRepository.create(data);
  }
}
