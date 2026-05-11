import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { loadAppUser } from '../middleware/loadAppUser';
import {
  assertValidUserRole,
  getUserById,
  listUsers,
} from '../services/userService';
import { routeIdString } from '../utils/routeParams';

export const usersRouter = Router();

usersRouter.use(asyncHandler(loadAppUser));

usersRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const viewer = req.appUser!;
    const { role } = req.query;

    let roleFilter: ReturnType<typeof assertValidUserRole> | undefined;
    if (typeof role === 'string' && role.length > 0) {
      roleFilter = assertValidUserRole(role);
    }

    const rows = await listUsers(viewer, { role: roleFilter });
    res.json(rows);
  }),
);

usersRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const viewer = req.appUser!;
    const idStr = routeIdString(req.params.id);
    if (!idStr) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const id = Number.parseInt(idStr, 10);
    if (!Number.isFinite(id) || id < 1) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const row = await getUserById(viewer, id);
    res.json(row);
  }),
);
