import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, User, UserData } from '@prisma/client';
import {
  CreateUserContacts,
  CreateUserPreferences,
  FindNearestUsers,
  UpdateUserContact,
  UpdateUserData,
  UpdateUserPreferences,
} from './user.types';
import { UserDto } from './dto/user-dto';

@Injectable()
export class UserRepository {
  constructor(private readonly db: PrismaService) {}

  async deleteUser(id: number): Promise<void> {
    await this.db.$transaction([
      this.db.userData.delete({
        where: { userId: id },
      }),
      this.db.userPreferences.delete({
        where: { userId: id },
      }),
      this.db.activeRefreshToken.delete({
        where: { userId: id },
      }),
      this.db.match.deleteMany({
        where: { OR: [{ likedUserId: id }, { userId: id }] },
      }),
      this.db.spotifyActiveRefreshToken.delete({
        where: { userId: id },
      }),
      this.db.user.delete({
        where: { id },
      }),
    ]);
  }

  async getMatchedUser(
    targetId: number,
    userId: number,
  ): Promise<UserDto | null> {
    if (targetId === userId) {
      return await this.db.user.findUnique({
        where: { id: targetId },
        include: {
          userData: {
            include: {
              contacts: true,
            },
          },
          userPreferences: {
            include: {
              genres: true,
            },
          },
        },
      });
    }

    const match = await this.db.match.findFirst({
      where: {
        OR: [
          {
            userId: userId,
            likedUserId: targetId,
            isAccepted: true,
          },
          {
            likedUserId: userId,
            userId: targetId,
            isAccepted: true,
          },
        ],
      },
    });

    if (!match) {
      return await this.db.user.findUnique({
        where: { id: targetId, NOT: { id: userId } },
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
    return await this.db.user.findUnique({
      where: { id: targetId, NOT: { id: userId } },
      include: {
        userData: {
          include: {
            contacts: true,
          },
        },
        userPreferences: {
          include: {
            genres: true,
          },
        },
      },
    });
  }

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

  private createUpdateUserPreferencesString(
    data: UpdateUserPreferences,
  ): Prisma.Sql {
    const updates: Prisma.Sql[] = [];
    for (const [k, v] of Object.entries(data)) {
      switch (k) {
        case 'desiredSex':
          updates.push(Prisma.sql`"desiredSex" = ${v}::"PreferencesSex"`);
          break;
        case 'genresVector':
          updates.push(Prisma.sql`"genresVector" = ${v}::vector`);
          break;
        case 'genresIds':
          break;
        case 'userId':
          break;
      }
    }

    return Prisma.join(updates);
  }

  async updateUserPreferences(data: UpdateUserPreferences): Promise<void> {
    const updateString = this.createUpdateUserPreferencesString(data);

    await this.db.$executeRaw`
      UPDATE "UserPreferences" SET ${updateString} WHERE "userId" = ${data.userId}
    `;

    if (data.genresIds) {
      await this.db.userPreferences.update({
        where: {
          userId: data.userId,
        },
        data: {
          genres: {
            set: data.genresIds.map((id) => ({ id })),
          },
        },
      });
    }
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
          set: data.genresIds.map((id) => ({ id })),
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
  }: FindNearestUsers): Promise<UserDto[]> {
    const users: User[] = await this.db.$queryRaw`
        SELECT u.*
        FROM "User" AS u
        JOIN "UserPreferences" AS targetPref ON u.id = targetPref."userId"
        JOIN "UserData" AS targetData ON u.id = targetData."userId"
        JOIN "UserPreferences" AS userPref ON userPref."userId" = ${userId}
        JOIN "UserData" AS userData ON userData."userId" = ${userId}
        WHERE u.id != ${userId}
          AND u.id NOT IN(${seen.length > 0 ? Prisma.join(seen) : 0})
					AND (
						(userPref."desiredSex" = 'BOTH' AND targetPref."desiredSex" IN ('BOTH', 'MALE', 'FEMALE'))
						AND targetData.sex IN ('MALE', 'FEMALE')
						OR
						(userPref."desiredSex" = 'MALE' AND targetData.sex = 'MALE' AND targetPref."desiredSex" IN ('BOTH', 'MALE'))
						OR
						(userPref."desiredSex" = 'FEMALE' AND targetData.sex = 'FEMALE' AND targetPref."desiredSex" IN ('BOTH', 'FEMALE'))
					)
        ORDER BY 
          targetPref."genresVector" <-> userPref."genresVector",
          ABS(targetData.age - userData.age)
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

  async createUserContacts(
    data: CreateUserContacts,
    userId: number,
  ): Promise<void> {
    await Promise.all(
      data.map((contact) =>
        this.db.userContact.create({
          data: {
            ...contact,
            userData: {
              connect: {
                userId,
              },
            },
          },
        }),
      ),
    );
  }

  async updateUserContact(data: UpdateUserContact): Promise<void> {
    await this.db.userContact.update({
      where: {
        id: data.id,
      },
      data: {
        ...data,
      },
    });
  }
}
