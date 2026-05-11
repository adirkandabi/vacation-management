import type { User } from '../entities';

declare module 'express-serve-static-core' {
  interface Request {
    appUser?: User;
  }
}

export {};
