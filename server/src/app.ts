import './types/express-augment';
import cors from 'cors';
import express, { type Express } from 'express';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { usersRouter } from './routes/users';
import { vacationRequestsRouter } from './routes/vacationRequests';

export function buildApp(): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/users', usersRouter);
  app.use('/api/vacation-requests', vacationRequestsRouter);
  app.use(errorHandler);

  return app;
}
