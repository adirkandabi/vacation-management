import { AppDataSource } from './data-source';
import { User, UserRole } from './entities';

/**
 * Inserts demo users when the database has no users.
 * Skips entirely if any user row already exists.
 */
export async function ensureSeedData(): Promise<void> {
  const userRepo = AppDataSource.getRepository(User);
  if ((await userRepo.count()) > 0) {
    return;
  }

  await userRepo.save([
    userRepo.create({ name: 'Demo Requester One', role: UserRole.Requester }),
    userRepo.create({ name: 'Demo Requester Two', role: UserRole.Requester }),
    userRepo.create({ name: 'Demo Manager', role: UserRole.Validator }),
  ]);
}
