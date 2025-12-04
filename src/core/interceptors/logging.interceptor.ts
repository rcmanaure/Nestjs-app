import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;
    const userId = user?.id || 'anonymous';
    const now = Date.now();

    this.logger.log(`[${userId}] ${method} ${url} - Request started`);

    return next.handle().pipe(
      tap((data) => {
        const responseTime = Date.now() - now;
        this.logger.log(
          `[${userId}] ${method} ${url} - Completed in ${responseTime}ms`,
        );
      }),
    );
  }
}
