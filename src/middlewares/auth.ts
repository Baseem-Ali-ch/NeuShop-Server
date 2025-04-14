import { NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HttpStatusCode } from '../constants/httpStatusCodes';

export const verifyToken = async (req: any, res: any, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = (decoded as any).id;
    next();
  } catch (error) {
    console.log('Invalid token', error);
    return res.status(HttpStatusCode.FORBIDDEN).json({ message: 'Access Denied' });
  }
};
