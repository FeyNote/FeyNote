import { Request, Response, NextFunction } from 'express';
import { prisma } from '@feynote/prisma/client';
import { isSessionExpired } from '../../session/isSessionExpired';

export const validateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token = req.headers.authorization;
  if (!token) {
    return res.status(401).send('Authorization header is required');
  }
  token = token.trim().split('Bearer ')[1];
  const session = await prisma.session.findUnique({
    where: {
      token,
    },
  });
  if (!session || isSessionExpired(session)) {
    return res
      .status(401)
      .send('Session not found or expired with the provided token');
  }
  req.userId = session.userId;
  return next();
};
