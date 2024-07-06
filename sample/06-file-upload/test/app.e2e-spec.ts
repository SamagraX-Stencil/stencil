import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import * as path from 'path';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World from sample/06-file-upload!');
  });

  it('/files/download (GET)', () => {
    return request(app.getHttpServer())
      .get('/files/download/ayush')
      .expect(200) // Use 200 or another status code based on your API's behavior
      .expect('Content-Type', /application\/octet-stream/) // Or another appropriate content type
      .then(response => {
        expect(response.body).toBeDefined();
      });
  });

  it('/upload-file (POST)', async () => {
    const filePath = path.join(__dirname, '../uploads', 'cred.txt');

    const response = await request(app.getHttpServer())
      .post('/upload-file')
      .query({ destination: 'uploads', filename: 'cred.txt' })
      .attach('file', filePath)
      .expect(201);

    expect(response.body).toEqual({
      message: 'File uploaded successfully',
      file: { url: 'uploads/cred.txt' }, // Ensure this matches the expected response
    });
  });
});
