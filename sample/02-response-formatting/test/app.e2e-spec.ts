import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { readFileSync } from 'node:fs';
// import path from 'node:path';
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

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World from sample/06-file-upload!');
  });

  it('/files/download (GET)', () => {
    return request(app.getHttpServer())
      .get('/files/download/ayush')
      .expect(File);
  });  

  it('/upload-files (POST)', async () => {
    const filePath = path.join(__dirname, '../uploads', 'ayush');
    //const fileContent = readFileSync(filePath);

    const response = await request(app.getHttpServer())
      .post('/upload-files')
      .query({ destination: 'uploads', filename: 'cred.txt' })
      .attach('file', filePath)
      .expect(201);

    expect(response.body).toEqual({
      message: 'File uploaded successfully',
      file: { url: 'uploads' },
    });
  });

});
