import { UserPreferences } from "@prisma/client";

export type FindNearestUsers = {
  userId: number;
  limit: number;
  seen: number[];
}

export type CreateUserPreferences = Omit<UserPreferences, 'id' >& {
  genresVector: number[];
}