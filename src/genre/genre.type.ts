import { Genre as PrismaGenre } from '@prisma/client';

export type Genre = PrismaGenre & {
  vector: number[];
};