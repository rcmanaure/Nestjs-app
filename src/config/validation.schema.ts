import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Application Configuration
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),

  // Database Configuration
  MONGODB_URI: Joi.string().required(),
  MONGODB_REPLICA_SET: Joi.string().optional(),

  // Clerk Authentication
  CLERK_SECRET_KEY: Joi.string().required(),
  CLERK_PUBLISHABLE_KEY: Joi.string().optional(),

  // AWS S3 Configuration
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_REGION: Joi.string().default('us-east-1'),
  AWS_S3_BUCKET_NAME: Joi.string().required(),

  // Redis Configuration
  REDIS_URL: Joi.string().default('redis://localhost:6379'),

  // Stripe Configuration
  STRIPE_SECRET_KEY: Joi.string().required(),
  STRIPE_PUBLISHABLE_KEY: Joi.string().optional(),
  STRIPE_WEBHOOK_SECRET: Joi.string().optional(),

  // JWT (if needed for additional auth)
  JWT_SECRET: Joi.string().optional(),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info'),
});
