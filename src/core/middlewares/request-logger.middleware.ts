import { Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const logger = new Logger('RequestLogger');

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const { method, originalUrl, ip } = req;
  const userAgent = req.get('User-Agent') || '';
  const startTime = Date.now();

  res.on('finish', () => {
    const { statusCode } = res;
    const contentLength = res.get('Content-Length');
    const duration = Date.now() - startTime;

    logger.log(
      `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip} - ${duration}ms`,
    );
  });

  next();
}
