import { Genre, User, UserData, UserPreferences } from '@prisma/client';

export type FindNearestUsers = {
  userId: number;
  limit: number;
  seen: number[];
};

export type CreateUserPreferences = Omit<UserPreferences, 'id'> & {
  genresVector: number[];
  genresIds: number[];
};

export type UpdateUserData = Partial<Omit<UserData, 'id'>>;

type PreferencesWithGenres = UserPreferences & {
  genres: Genre[] | null;
};

export type FullUser = User & {
  userData: UserData | null;
  userPreferences: PreferencesWithGenres | null;
};