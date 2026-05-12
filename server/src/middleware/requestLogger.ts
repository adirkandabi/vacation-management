import type { NextFunction, Request, Response } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;
    const method = req.method;
    const path = req.originalUrl || req.url;
    const status = res.statusCode;

    // Basic single-line access log (keep it simple for the assignment)
    console.log(`${method} ${path} -> ${status} (${durationMs.toFixed(1)}ms)`);
  });

  next();
}

