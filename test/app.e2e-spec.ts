import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { setupTestModule, teardownTestModule } from './setup';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await setupTestModule({
      additionalModules: [AppModule],
    });

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await teardownTestModule();
  });

  describe('AppController', () => {
    it('/ (GET)', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('Users API', () => {
    const testUser = {
      clerkId: 'test-clerk-id-e2e',
      email: 'e2e-test@example.com',
      firstName: 'E2E',
      lastName: 'Test',
    };

    const authHeader = 'Bearer test-token';

    describe('POST /users', () => {
      it('should create a user', () => {
        return request(app.getHttpServer())
          .post('/users')
          .set('Authorization', authHeader)
          .send(testUser)
          .expect(201);
      });

      it('should return 401 without auth', () => {
        return request(app.getHttpServer())
          .post('/users')
          .send(testUser)
          .expect(401);
      });
    });

    describe('GET /users/profile', () => {
      it('should get user profile', () => {
        return request(app.getHttpServer())
          .get('/users/profile')
          .set('Authorization', authHeader)
          .expect(200);
      });

      it('should return 401 without auth', () => {
        return request(app.getHttpServer())
          .get('/users/profile')
          .expect(401);
      });
    });

    describe('GET /users', () => {
      it('should return 401 without proper role', () => {
        return request(app.getHttpServer())
          .get('/users')
          .set('Authorization', authHeader)
          .expect(403); // Forbidden due to role check
      });
    });
  });

  describe('Swagger', () => {
    it('/api (GET)', () => {
      return request(app.getHttpServer())
        .get('/api')
        .expect(200);
    });
  });
});
