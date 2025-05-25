import { UserData, UserPreferences } from '@prisma/client';

export type FindNearestUsers = {
  userId: number;
  limit: number;
  seen: number[];
};

export type UpdateUserPreferences = Partial<Omit<CreateUserPreferences, 'userId'>> & {userId: number}

export type CreateUserPreferences = Omit<UserPreferences, 'id'> & {
  genresVector: number[];
  genresIds: number[];
};

export type UpdateUserData = Partial<Omit<UserData, 'id'>>;
