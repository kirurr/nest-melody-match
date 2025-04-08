import { UserPreferences as PrismaUserPreferences } from '@prisma/client';

export type UserPreferences = PrismaUserPreferences & {
  genresVector: number[];
}

export type FindNearestUsers = {
  userId: number;
  limit: number;
  seen: number[];
}