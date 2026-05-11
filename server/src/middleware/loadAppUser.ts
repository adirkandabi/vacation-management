import type { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { AppError } from '../errors/AppError';
import { User } from '../entities';

/**
 * Demo identity: client sends which user they act as via `X-User-Id`.
 * Not a substitute for real authentication (anyone can send any id).
 */
export async function loadAppUser(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const raw = req.headers['x-user-id'];
    const headerVal = Array.isArray(raw) ? raw[0] : raw;
    if (headerVal === undefined || headerVal === '') {
      throw new AppError(400, 'X-User-Id header is required');
    }
    const id = Number.parseInt(headerVal, 10);
    if (!Number.isFinite(id) || id < 1) {
      throw new AppError(400, 'X-User-Id must be a positive integer');
    }
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id },
    });
    if (!user) {
      throw new AppError(400, 'No user matches X-User-Id');
    }
    req.appUser = user;
    next();
  } catch (e) {
    next(e);
  }
}
