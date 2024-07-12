import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import path from 'path';
import * as fs from 'fs';

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
      .expect('Hello World!');
  });

  it('/files/upload-file (POST); for file with content', async () => {
    const testFilePath = path.join(__dirname, 'empty.txt');

    fs.writeFileSync(testFilePath, 'abcd');
    const mockDestination = 'uploads';
    const mockFilename = 'content.txt';

    const response = await request(app.getHttpServer())
      .post(
        `/files/upload-file?destination=${mockDestination}&filename=${mockFilename}`,
      )
      .attach('file', Buffer.from('content'), mockFilename);

    expect(response.body).toEqual({
      message: 'File uploaded successfully',
      file: { url: `${mockDestination}/${mockFilename}` },
    });
  });

  it('/files/upload-file (POST); for empty file check', async () => {
    const mockDestination = 'uploads';
    const mockFilename = 'empty.txt';

    const response = await request(app.getHttpServer())
      .post(
        `/files/upload-file?destination=${mockDestination}&filename=${mockFilename}`,
      )
      .attach('file', Buffer.from(''), mockFilename);

    console.log('Response:', response.body);

    expect(response.body).toEqual({
      statusCode: 400,
      message: 'empty file uploads are not allowed',
    });
  });
});
