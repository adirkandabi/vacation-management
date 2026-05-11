import 'reflect-metadata';
import 'dotenv/config';
import '../../src/types/express-augment';
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';
import request from 'supertest';
import { buildApp } from '../../src/app';
import { AppDataSource } from '../../src/data-source';
import { User, UserRole } from '../../src/entities';
import { ensureSeedData } from '../../src/seed';

const app = buildApp();

describe('API integration (requires PostgreSQL from docker-compose)', () => {
  let validatorUser: User;
  let requesterOne: User;
  let requesterTwo: User;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    await ensureSeedData();

    const repo = AppDataSource.getRepository(User);
    const all = await repo.find({ order: { id: 'ASC' } });
    const validators = all.filter((u) => u.role === UserRole.Validator);
    const requesters = all.filter((u) => u.role === UserRole.Requester);

    if (validators.length < 1 || requesters.length < 2) {
      throw new Error(
        'Expected seeded users: at least 1 Validator and 2 Requesters. Reset DB or run seed.',
      );
    }

    validatorUser = validators[0]!;
    requesterOne = requesters[0]!;
    requesterTwo = requesters[1]!;
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /api/users without X-User-Id returns 400', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/X-User-Id/i);
  });

  it('GET /api/users as Requester returns only self', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('X-User-Id', String(requesterOne.id));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(requesterOne.id);
  });

  it('GET /api/users as Validator returns all users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('X-User-Id', String(validatorUser.id));

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(3);
  });

  it('Requester cannot approve vacation requests', async () => {
    const res = await request(app)
      .post('/api/vacation-requests/999999/approve')
      .set('X-User-Id', String(requesterOne.id))
      .send({});

    expect(res.status).toBe(403);
  });

  it('Requester creates own request; Validator can approve', async () => {
    const create = await request(app)
      .post('/api/vacation-requests')
      .set('X-User-Id', String(requesterOne.id))
      .send({
        userId: requesterOne.id,
        startDate: '2030-06-01',
        endDate: '2030-06-05',
        reason: 'integration test',
      });

    expect(create.status).toBe(201);
    const requestId = create.body.id as number;

    const listOther = await request(app)
      .get('/api/vacation-requests')
      .set('X-User-Id', String(requesterTwo.id));

    expect(listOther.status).toBe(200);
    const ids = (listOther.body as { id: number }[]).map((r) => r.id);
    expect(ids).not.toContain(requestId);

    const approve = await request(app)
      .post(`/api/vacation-requests/${requestId}/approve`)
      .set('X-User-Id', String(validatorUser.id))
      .send({ comments: 'Approved in test' });

    expect(approve.status).toBe(200);
    expect(approve.body.status).toBe('Approved');
  });

  it('Reject requires non-empty comments', async () => {
    const create = await request(app)
      .post('/api/vacation-requests')
      .set('X-User-Id', String(requesterTwo.id))
      .send({
        userId: requesterTwo.id,
        startDate: '2030-07-01',
        endDate: '2030-07-03',
        reason: 'for reject test',
      });
    expect(create.status).toBe(201);
    const requestId = create.body.id as number;

    const bad = await request(app)
      .post(`/api/vacation-requests/${requestId}/reject`)
      .set('X-User-Id', String(validatorUser.id))
      .send({ comments: '   ' });

    expect(bad.status).toBe(400);

    const ok = await request(app)
      .post(`/api/vacation-requests/${requestId}/reject`)
      .set('X-User-Id', String(validatorUser.id))
      .send({ comments: 'No capacity that week' });

    expect(ok.status).toBe(200);
    expect(ok.body.status).toBe('Rejected');
  });
});
