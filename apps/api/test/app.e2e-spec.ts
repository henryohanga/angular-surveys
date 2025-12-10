import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app/app.module';

describe('API E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true })
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('/api/health (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('uptime');
        });
    });
  });

  describe('Auth Endpoints', () => {
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'testPassword123',
      name: 'Test User',
    };

    it('/api/auth/register (POST) - validation error', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'invalid-email' })
        .expect(400);
    });

    it('/api/auth/login (POST) - validation error', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'test@example.com' }) // Missing password
        .expect(400);
    });

    it('/api/auth/me (GET) - unauthorized', () => {
      return request(app.getHttpServer()).get('/api/auth/me').expect(401);
    });
  });

  describe('Surveys Endpoints', () => {
    it('/api/surveys (GET) - unauthorized', () => {
      return request(app.getHttpServer()).get('/api/surveys').expect(401);
    });

    it('/api/surveys (POST) - unauthorized', () => {
      return request(app.getHttpServer())
        .post('/api/surveys')
        .send({ name: 'Test Survey' })
        .expect(401);
    });
  });
});
