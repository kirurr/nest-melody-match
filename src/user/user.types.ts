import { UserContact, UserData, UserPreferences } from '@prisma/client';

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

export type CreateUserContacts = Omit<UserContact, 'id'>[];

export type UpdateUserContacts = Partial<Omit<UserContact, 'id'>> & {id: number}[];

export type UpdateUserContact = Partial<Omit<UserContact, 'id'>> & {id: number};

