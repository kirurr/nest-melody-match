import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, User, UserData } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly db: PrismaService) {}

  async findUserById(id: number): Promise<User | null> {
    return await this.db.user.findUnique({
      where: { id },
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.db.user.findUnique({
      where: { email },
    });
  }

  async createUser(user: Prisma.UserCreateInput): Promise<User> {
    return await this.db.user.create({
      data: user,
    });
  }

  async createUserData(data: Prisma.UserDataCreateInput): Promise<UserData> {
    return await this.db.userData.create({
      data: data,
    });
  }

  async createUserPreferences(data: {
    userId: number;
    genresVector: number[];
    desiredSex: 'MALE' | 'FEMALE';
  }): Promise<void> {
    await this.db.$executeRaw`
      INSERT INTO "UserPreferences" ("userId", "genresVector", "desiredSex")
      VALUES (${data.userId}, ${data.genresVector}::vector, ${data.desiredSex}::"Sex")
    `;
  }

  async findNearestUsersByUserId(
    userId: number,
    limit: number,
  ): Promise<User[]> {
    const users: User[]  = await this.db.$queryRaw`
      select u.* from "User" as u 
      join "UserPreferences" as up
      on u."id" = up."userId" 
      where u."id" != ${userId}
      order by up."genresVector" <->
      (select "genresVector" from "UserPreferences" where "userId" = ${userId})
      limit ${limit}
    `;
    return users
  }
}
