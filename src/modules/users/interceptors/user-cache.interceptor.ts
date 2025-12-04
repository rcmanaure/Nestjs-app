import {
  Injectable,
  ExecutionContext,
  CallHandler,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisService } from '../../../shared';

@Injectable()
export class UserCacheInterceptor implements NestInterceptor {
  constructor(private readonly redisService: RedisService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    // Only cache GET requests
    if (method !== 'GET') {
      return next.handle();
    }

    const cacheKey = `user:${url}`;

    // Try to get from cache
    try {
      const cachedData = await this.redisService.getJson(cacheKey);
      if (cachedData) {
        return of(cachedData);
      }
    } catch (error) {
      // Continue without cache if Redis fails
    }

    // Execute the request and cache the result
    return next.handle().pipe(
      tap(async (data) => {
        try {
          // Cache for 5 minutes
          await this.redisService.setJson(cacheKey, data, 300);
        } catch (error) {
          // Continue without caching if Redis fails
        }
      }),
    );
  }
}
