import { AppDataSource } from '../data-source';
import { AppError } from '../errors/AppError';
import { User, UserRole } from '../entities';

const userRepo = () => AppDataSource.getRepository(User);

export function assertValidUserRole(value: unknown): UserRole {
  if (
    typeof value === 'string' &&
    Object.values(UserRole).includes(value as UserRole)
  ) {
    return value as UserRole;
  }
  throw new AppError(
    400,
    `role must be one of: ${Object.values(UserRole).join(', ')}`,
  );
}

export async function listUsers(
  viewer: User,
  filters: {
    role?: UserRole;
  },
): Promise<User[]> {
  if (viewer.role === UserRole.Validator) {
    return userRepo().find({
      where: filters.role !== undefined ? { role: filters.role } : {},
      order: { id: 'ASC' },
    });
  }

  if (filters.role !== undefined && filters.role !== viewer.role) {
    throw new AppError(403, 'You are not allowed to list users with that role');
  }

  return [viewer];
}

export async function getUserById(viewer: User, id: number): Promise<User> {
  if (viewer.role === UserRole.Validator) {
    const row = await userRepo().findOne({ where: { id } });
    if (!row) {
      throw new AppError(404, 'User not found');
    }
    return row;
  }

  if (id !== viewer.id) {
    throw new AppError(403, 'You can only view your own user profile');
  }

  const row = await userRepo().findOne({ where: { id } });
  if (!row) {
    throw new AppError(404, 'User not found');
  }
  return row;
}
