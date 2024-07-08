import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import * as fs from 'fs';
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
      .expect('Hello World from file upload.');
  });

  it('/files/upload-file (POST); for file with content', async () => {
    const mockDestination = 'uploads';
    const mockFilename = 'empty.txt';
    const response = await request(app.getHttpServer())
      .post(
        `/files/upload-file?destination=${mockDestination}&filename=${mockFilename}`,
      )
      .attach('file', Buffer.from('abcd'), mockFilename);
    expect(response.body).toEqual({
      message: 'File uploaded successfully',
      file: { url: mockDestination },
    });

    // clean up created file from uploads dir
    const emptyFilePath = path.join(__dirname, '../uploads/empty.txt');
    fs.unlinkSync(emptyFilePath);
  });

  it('/files/upload-file (POST); for empty file check', async () => {
    const mockDestination = 'uploads';
    const mockFilename = 'empty.txt';
    const response = await request(app.getHttpServer())
      .post(
        `/files/upload-file?destination=${mockDestination}&filename=${mockFilename}`,
      )
      .attach('file', Buffer.from(''), mockFilename);
    expect(response.body).toEqual({
      statusCode: 400,
      message: 'empty file uploads are not allowed',
    });
  });
});
