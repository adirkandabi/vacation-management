import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { loadAppUser } from '../middleware/loadAppUser';
import {
  assertValidStatus,
  approveVacationRequest,
  createVacationRequest,
  deleteVacationRequest,
  getVacationRequestById,
  listVacationRequests,
  rejectVacationRequest,
  updateVacationRequest,
} from '../services/vacationRequestService';
import { routeIdString } from '../utils/routeParams';

export const vacationRequestsRouter = Router();

vacationRequestsRouter.use(asyncHandler(loadAppUser));

vacationRequestsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const viewer = req.appUser!;
    const { status, userId } = req.query;

    let statusFilter: ReturnType<typeof assertValidStatus> | undefined;
    if (typeof status === 'string' && status.length > 0) {
      statusFilter = assertValidStatus(status);
    }

    let userIdFilter: number | undefined;
    if (typeof userId === 'string' && userId.length > 0) {
      const n = Number.parseInt(userId, 10);
      if (!Number.isFinite(n) || n < 1) {
        res.status(400).json({ error: 'userId must be a positive integer' });
        return;
      }
      userIdFilter = n;
    }

    const rows = await listVacationRequests(viewer, {
      status: statusFilter,
      userId: userIdFilter,
    });
    res.json(rows);
  }),
);

vacationRequestsRouter.get(
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
    const row = await getVacationRequestById(id, viewer);
    res.json(row);
  }),
);

vacationRequestsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const viewer = req.appUser!;
    const created = await createVacationRequest(viewer, req.body ?? {});
    res.status(201).json(created);
  }),
);

vacationRequestsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const viewer = req.appUser!;
    const idStr = routeIdString(req.params.id);
    if (!idStr) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const updated = await updateVacationRequest(viewer, idStr, req.body ?? {});
    res.json(updated);
  }),
);

vacationRequestsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const viewer = req.appUser!;
    const idStr = routeIdString(req.params.id);
    if (!idStr) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    await deleteVacationRequest(viewer, idStr);
    res.status(204).send();
  }),
);

vacationRequestsRouter.post(
  '/:id/approve',
  asyncHandler(async (req, res) => {
    const viewer = req.appUser!;
    const idStr = routeIdString(req.params.id);
    if (!idStr) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const body = req.body ?? {};
    const updated = await approveVacationRequest(
      viewer,
      idStr,
      body.comments,
    );
    res.json(updated);
  }),
);

vacationRequestsRouter.post(
  '/:id/reject',
  asyncHandler(async (req, res) => {
    const viewer = req.appUser!;
    const idStr = routeIdString(req.params.id);
    if (!idStr) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const body = req.body ?? {};
    const updated = await rejectVacationRequest(
      viewer,
      idStr,
      body.comments,
    );
    res.json(updated);
  }),
);
