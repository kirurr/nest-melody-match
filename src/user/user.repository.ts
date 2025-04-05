import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PreferencesSex, Prisma, User, UserData } from '@prisma/client';

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
    desiredSex: PreferencesSex;
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
    const users: User[] = await this.db.$queryRaw`
        SELECT u.*
        FROM "User" AS u
        JOIN "UserPreferences" AS up ON u."id" = up."userId"
        JOIN "UserData" AS ud ON u.id = ud.id
        JOIN "UserPreferences" AS up1 ON up1."userId" = ${userId}
        JOIN "UserData" AS ud1 ON ud1."userId" = ${userId}
        WHERE u."id" != ${userId}
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
          END
        ORDER BY 
          up."genresVector" <-> up1."genresVector",
          ABS(ud.age - ud1.age)
        LIMIT ${limit}`;
    return users;
  }
}
