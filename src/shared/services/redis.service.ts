import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'redis';
import { LoggerService } from './logger.service';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis.RedisClientType;
  private readonly logger = new LoggerService();

  constructor(private configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL', 'redis://localhost:6379');

    this.client = Redis.createClient({
      url: redisUrl,
    });

    this.client.on('error', (error) => {
      this.logger.error(`Redis connection error: ${error.message}`, error.stack);
    });

    this.client.on('connect', () => {
      this.logger.log('Connected to Redis');
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
    this.logger.log('Redis connection closed');
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }

      this.logger.debug(`Redis SET: ${key}`, {
        operation: 'set',
        metadata: { ttl },
      });
    } catch (error) {
      this.logger.error(`Redis SET failed for key ${key}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      const value = await this.client.get(key);

      this.logger.debug(`Redis GET: ${key}`, {
        operation: 'get',
        metadata: { found: value !== null },
      });

      return value;
    } catch (error) {
      this.logger.error(`Redis GET failed for key ${key}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async del(key: string): Promise<number> {
    try {
      const result = await this.client.del(key);

      this.logger.debug(`Redis DEL: ${key}`, {
        operation: 'del',
        metadata: { deleted: result },
      });

      return result;
    } catch (error) {
      this.logger.error(`Redis DEL failed for key ${key}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async exists(key: string): Promise<number> {
    try {
      const result = await this.client.exists(key);
      return result;
    } catch (error) {
      this.logger.error(`Redis EXISTS failed for key ${key}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async expire(key: string, ttl: number): Promise<number> {
    try {
      const result = await this.client.expire(key, ttl);

      this.logger.debug(`Redis EXPIRE: ${key}`, {
        operation: 'expire',
        metadata: { ttl, success: result === 1 },
      });

      return result;
    } catch (error) {
      this.logger.error(`Redis EXPIRE failed for key ${key}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      const result = await this.client.ttl(key);
      return result;
    } catch (error) {
      this.logger.error(`Redis TTL failed for key ${key}: ${error.message}`, error.stack);
      throw error;
    }
  }

  // JSON operations
  async setJson(key: string, value: any, ttl?: number): Promise<void> {
    const jsonValue = JSON.stringify(value);
    await this.set(key, jsonValue, ttl);
  }

  async getJson<T = any>(key: string): Promise<T | null> {
    const value = await this.get(key);
    return value ? JSON.parse(value) : null;
  }
}
