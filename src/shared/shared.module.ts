import { Global, Module } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { StripeService } from './services/stripe.service';
import { AwsS3Service } from './services/aws-s3.service';
import { RedisService } from './services/redis.service';

@Global()
@Module({
  providers: [LoggerService, StripeService, AwsS3Service, RedisService],
  exports: [LoggerService, StripeService, AwsS3Service, RedisService],
})
export class SharedModule {}
