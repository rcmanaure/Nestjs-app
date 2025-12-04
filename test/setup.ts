import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

let mongoServer: MongoMemoryServer;

export const setupTestModule = async (options?: {
  mongoUri?: string;
  additionalModules?: any[];
}): Promise<TestingModule> => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = options?.mongoUri || mongoServer.getUri();

  const mongooseOptions: MongooseModuleOptions = {
    uri: mongoUri,
  };

  const modules = [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.test', '.env'],
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    MongooseModule.forRoot(mongooseOptions),
    ...(options?.additionalModules || []),
  ];

  const moduleFixture = await Test.createTestingModule({
    imports: modules,
  }).compile();

  return moduleFixture;
};

export const teardownTestModule = async (): Promise<void> => {
  if (mongoServer) {
    await mongoServer.stop();
  }
};

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.CLERK_SECRET_KEY = 'test_clerk_secret';
  process.env.STRIPE_SECRET_KEY = 'sk_test_123';
  process.env.AWS_ACCESS_KEY_ID = 'test_key';
  process.env.AWS_SECRET_ACCESS_KEY = 'test_secret';
  process.env.AWS_S3_BUCKET_NAME = 'test-bucket';
  process.env.REDIS_URL = 'redis://localhost:6379';
});

afterAll(async () => {
  await teardownTestModule();
});

// Mock external services
jest.mock('@clerk/clerk-sdk-node', () => ({
  verifyToken: jest.fn().mockResolvedValue({
    sub: 'test-user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    roles: ['user'],
  }),
}));

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn().mockResolvedValue({ id: 'cus_test123' }),
    },
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test123',
        client_secret: 'pi_test_secret',
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'pi_test123',
        status: 'succeeded',
      }),
    },
    webhookEndpoints: {
      create: jest.fn().mockResolvedValue({ id: 'we_test123' }),
    },
    webhooks: {
      constructEvent: jest.fn().mockReturnValue({
        type: 'payment_intent.succeeded',
        data: { object: {} },
      }),
    },
  }));
});

jest.mock('aws-sdk', () => ({
  S3: jest.fn().mockImplementation(() => ({
    upload: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        Location: 'https://test-bucket.s3.amazonaws.com/test-key',
        Key: 'test-key',
      }),
    }),
    deleteObject: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({}),
    }),
    getSignedUrlPromise: jest.fn().mockResolvedValue('https://signed-url.com'),
  })),
}));

jest.mock('redis', () => ({
  createClient: jest.fn().mockReturnValue({
    on: jest.fn(),
    set: jest.fn().mockImplementation((key, value, callback) => callback(null, 'OK')),
    get: jest.fn().mockImplementation((key, callback) => callback(null, 'test_value')),
    del: jest.fn().mockImplementation((key, callback) => callback(null, 1)),
    exists: jest.fn().mockImplementation((key, callback) => callback(null, 1)),
    expire: jest.fn().mockImplementation((key, ttl, callback) => callback(null, 1)),
    ttl: jest.fn().mockImplementation((key, callback) => callback(null, 300)),
    quit: jest.fn().mockImplementation((callback) => callback()),
  }),
}));
