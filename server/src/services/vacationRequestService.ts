import { AppDataSource } from '../data-source';
import { AppError } from '../errors/AppError';
import {
  User,
  UserRole,
  VacationRequest,
  VacationRequestStatus,
} from '../entities';
import { assertEndOnOrAfterStart, parseIsoDateOnly } from '../utils/dateValidation';

const requestRepo = () => AppDataSource.getRepository(VacationRequest);
const userRepo = () => AppDataSource.getRepository(User);

function assertValidator(viewer: User): void {
  if (viewer.role !== UserRole.Validator) {
    throw new AppError(
      403,
      'Only users with role Validator may perform this action',
    );
  }
}

function assertRequester(viewer: User): void {
  if (viewer.role !== UserRole.Requester) {
    throw new AppError(
      403,
      'Only users with role Requester may perform this action',
    );
  }
}

export function assertValidStatus(value: unknown): VacationRequestStatus {
  if (
    typeof value === 'string' &&
    Object.values(VacationRequestStatus).includes(
      value as VacationRequestStatus,
    )
  ) {
    return value as VacationRequestStatus;
  }
  throw new AppError(
    400,
    `status must be one of: ${Object.values(VacationRequestStatus).join(', ')}`,
  );
}

function parseIdParam(raw: string): number {
  const id = Number.parseInt(raw, 10);
  if (!Number.isFinite(id) || id < 1) {
    throw new AppError(400, 'Invalid id');
  }
  return id;
}

export async function listVacationRequests(
  viewer: User,
  filters: {
    status?: VacationRequestStatus;
    userId?: number;
  },
): Promise<VacationRequest[]> {
  if (viewer.role === UserRole.Validator) {
    return requestRepo().find({
      where: {
        ...(filters.status !== undefined ? { status: filters.status } : {}),
        ...(filters.userId !== undefined ? { userId: filters.userId } : {}),
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  assertRequester(viewer);
  return requestRepo().find({
    where: {
      userId: viewer.id,
      ...(filters.status !== undefined ? { status: filters.status } : {}),
    },
    relations: ['user'],
    order: { createdAt: 'DESC' },
  });
}

export async function getVacationRequestById(
  id: number,
  viewer: User,
): Promise<VacationRequest> {
  const row = await requestRepo().findOne({
    where: { id },
    relations: ['user'],
  });
  if (!row) {
    throw new AppError(404, 'Vacation request not found');
  }
  if (
    viewer.role === UserRole.Requester &&
    row.userId !== viewer.id
  ) {
    throw new AppError(403, 'You can only access your own vacation requests');
  }
  return row;
}

export async function createVacationRequest(
  viewer: User,
  body: {
    userId: unknown;
    startDate: unknown;
    endDate: unknown;
    reason?: unknown;
  },
): Promise<VacationRequest> {
  assertRequester(viewer);

  const userId = Number.parseInt(String(body.userId), 10);
  if (!Number.isFinite(userId) || userId < 1) {
    throw new AppError(400, 'userId is required and must be a positive integer');
  }
  if (userId !== viewer.id) {
    throw new AppError(403, 'You may only create vacation requests for yourself');
  }

  const user = await userRepo().findOne({ where: { id: userId } });
  if (!user) {
    throw new AppError(400, 'User not found');
  }
  if (user.role !== UserRole.Requester) {
    throw new AppError(
      400,
      'Vacation requests can only be created for users with role Requester',
    );
  }

  const startDate = parseIsoDateOnly(body.startDate);
  const endDate = parseIsoDateOnly(body.endDate);
  if (!startDate || !endDate) {
    throw new AppError(
      400,
      'startDate and endDate are required as YYYY-MM-DD strings',
    );
  }
  assertEndOnOrAfterStart(startDate, endDate);

  let reason: string | null = null;
  if (body.reason !== undefined && body.reason !== null) {
    if (typeof body.reason !== 'string') {
      throw new AppError(400, 'reason must be a string when provided');
    }
    reason = body.reason.trim() === '' ? null : body.reason.trim();
  }

  const entity = requestRepo().create({
    userId,
    startDate,
    endDate,
    reason,
    status: VacationRequestStatus.Pending,
    comments: null,
  });
  const saved = await requestRepo().save(entity);
  return getVacationRequestById(saved.id, viewer);
}

export async function updateVacationRequest(
  viewer: User,
  rawId: string,
  body: { startDate?: unknown; endDate?: unknown; reason?: unknown },
): Promise<VacationRequest> {
  assertRequester(viewer);
  const id = parseIdParam(rawId);
  const row = await requestRepo().findOne({ where: { id } });
  if (!row) {
    throw new AppError(404, 'Vacation request not found');
  }
  if (row.userId !== viewer.id) {
    throw new AppError(403, 'You can only update your own vacation requests');
  }
  if (row.status !== VacationRequestStatus.Pending) {
    throw new AppError(
      409,
      'Only requests in Pending status can be updated',
    );
  }

  const start =
    body.startDate !== undefined
      ? parseIsoDateOnly(body.startDate)
      : row.startDate;
  const end =
    body.endDate !== undefined ? parseIsoDateOnly(body.endDate) : row.endDate;

  if (body.startDate !== undefined && !start) {
    throw new AppError(400, 'startDate must be a YYYY-MM-DD string');
  }
  if (body.endDate !== undefined && !end) {
    throw new AppError(400, 'endDate must be a YYYY-MM-DD string');
  }
  if (!start || !end) {
    throw new AppError(500, 'Invalid date state');
  }
  assertEndOnOrAfterStart(start, end);

  row.startDate = start;
  row.endDate = end;

  if (body.reason !== undefined) {
    if (body.reason === null) {
      row.reason = null;
    } else if (typeof body.reason === 'string') {
      row.reason = body.reason.trim() === '' ? null : body.reason.trim();
    } else {
      throw new AppError(400, 'reason must be a string or null');
    }
  }

  await requestRepo().save(row);
  return getVacationRequestById(id, viewer);
}

export async function deleteVacationRequest(
  viewer: User,
  rawId: string,
): Promise<void> {
  assertRequester(viewer);
  const id = parseIdParam(rawId);
  const row = await requestRepo().findOne({ where: { id } });
  if (!row) {
    throw new AppError(404, 'Vacation request not found');
  }
  if (row.userId !== viewer.id) {
    throw new AppError(403, 'You can only delete your own vacation requests');
  }
  if (row.status !== VacationRequestStatus.Pending) {
    throw new AppError(
      409,
      'Only requests in Pending status can be deleted',
    );
  }
  await requestRepo().remove(row);
}

export async function approveVacationRequest(
  viewer: User,
  rawId: string,
  comments?: unknown,
): Promise<VacationRequest> {
  assertValidator(viewer);
  const id = parseIdParam(rawId);
  const row = await requestRepo().findOne({ where: { id } });
  if (!row) {
    throw new AppError(404, 'Vacation request not found');
  }
  if (row.status !== VacationRequestStatus.Pending) {
    throw new AppError(
      409,
      'Only pending requests can be approved',
    );
  }

  row.status = VacationRequestStatus.Approved;
  if (comments !== undefined) {
    if (comments !== null && typeof comments !== 'string') {
      throw new AppError(400, 'comments must be a string when provided');
    }
    row.comments =
      typeof comments === 'string' && comments.trim() !== ''
        ? comments.trim()
        : null;
  }

  await requestRepo().save(row);
  return getVacationRequestById(id, viewer);
}

export async function rejectVacationRequest(
  viewer: User,
  rawId: string,
  comments: unknown,
): Promise<VacationRequest> {
  assertValidator(viewer);
  const id = parseIdParam(rawId);
  const row = await requestRepo().findOne({ where: { id } });
  if (!row) {
    throw new AppError(404, 'Vacation request not found');
  }
  if (row.status !== VacationRequestStatus.Pending) {
    throw new AppError(
      409,
      'Only pending requests can be rejected',
    );
  }

  if (typeof comments !== 'string' || comments.trim() === '') {
    throw new AppError(
      400,
      'comments is required and must be a non-empty string when rejecting',
    );
  }

  row.status = VacationRequestStatus.Rejected;
  row.comments = comments.trim();
  await requestRepo().save(row);
  return getVacationRequestById(id, viewer);
}
