import { UserPreferences as PrismaUserPreferences } from '@prisma/client';

export type UserPreferences = PrismaUserPreferences & {
  genresVector: number[];
}
