import { Request } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';
import prisma from '../utils/prisma';
import { User } from '@prisma/client';

export interface Context {
  user: User | null;
  token: string | null;
  prisma: typeof prisma;
}

export const createContext = async ({ req }: { req: Request }): Promise<Context> => {
  const token = req.headers.authorization?.replace('Bearer ', '') || null;
  
  let user: User | null = null;
  
  if (token) {
    const payload: JWTPayload | null = verifyToken(token);
    if (payload) {
      user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });
    }
  }
  
  return {
    user,
    token,
    prisma,
  };
};
