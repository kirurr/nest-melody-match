import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, User, UserData } from '@prisma/client';
import {
  CreateUserPreferences,
  FindNearestUsers,
  FullUser,
  UpdateUserData,
} from './user.types';
import { UserDto } from './dto/user-dto';

@Injectable()
export class UserRepository {
  constructor(private readonly db: PrismaService) {}

  async getUser(id: number): Promise<UserDto | null> {
    return await this.db.user.findUnique({
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
  }

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

  async createUserPreferences(data: CreateUserPreferences): Promise<void> {
    await this.db.$executeRaw`
      INSERT INTO "UserPreferences" ("userId", "genresVector", "desiredSex")
      VALUES (
        ${data.userId},
        ${data.genresVector}::vector,
        ${data.desiredSex}::"PreferencesSex"
        )
    `;

    await this.db.userPreferences.update({
      where: {
        userId: data.userId,
      },
      data: {
        genres: {
          connect: data.genresIds.map((id) => ({ id })),
        },
      },
    });
  }

  async updateUserData(data: UpdateUserData): Promise<void> {
    await this.db.userData.update({
      where: {
        userId: data.userId,
      },
      data: {
        ...data,
      },
    });
  }

  async findNearestUsersByUserId({
    userId,
    limit,
    seen,
  }: FindNearestUsers): Promise<FullUser[]> {
    const users: User[] = await this.db.$queryRaw`
        SELECT u.*
        FROM "User" AS u
        JOIN "UserPreferences" AS up ON u.id = up."userId"
        JOIN "UserData" AS ud ON u.id = ud."userId"
        JOIN "UserPreferences" AS up1 ON up1."userId" = ${userId}
        JOIN "UserData" AS ud1 ON ud1."userId" = ${userId}
        WHERE u.id != ${userId}
          AND u.id NOT IN(${seen.length > 0 ? Prisma.join(seen) : 0})
          AND 1 = 
          CASE
            WHEN up1."desiredSex" = 'BOTH' and up."desiredSex" = 'BOTH' THEN 1
            WHEN up1."desiredSex" = 'MALE' and ud.sex = 'MALE' 
              and ud1.sex = 
                CASE
                  WHEN up."desiredSex" = 'BOTH' THEN ud1.sex
                  WHEN up."desiredSex" = 'MALE' THEN 'MALE' ELSE 'FEMALE'
                END 
            THEN 1
            WHEN up1."desiredSex" = 'FEMALE' and ud.sex = 'FEMALE' 
              and ud1.sex = 
                CASE
                  WHEN up."desiredSex" = 'BOTH' THEN ud1.sex
                  WHEN up."desiredSex" = 'MALE' THEN 'MALE' ELSE 'FEMALE'
                END 
            THEN 1
            ELSE 0
          END
        ORDER BY 
          up."genresVector" <-> up1."genresVector",
          ABS(ud.age - ud1.age)
        LIMIT ${limit}::int`;

    if (users.length === 0) {
      return [];
    }

    return await this.db.user.findMany({
      where: {
        id: {
          in: users.map((user) => user.id),
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
  }
}
