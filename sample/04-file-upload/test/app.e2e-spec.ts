import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
// import * as path from 'path';
// import * as fs from 'fs';

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

  // it('/files/upload-file (POST); for file with content', async () => {
  //   const testFilePath = path.join(__dirname, 'empty.txt');

  //   // Create an empty.txt file in the same directory as the test
  //   fs.writeFileSync(testFilePath, 'abcd');

  //   const mockDestination = 'uploads';
  //   const mockFilename = 'empty.txt';

  //   const response = await request(app.getHttpServer())
  //     .post(
  //       `/files/upload-file?destination=${mockDestination}&filename=${mockFilename}`,
  //     )
  //     .set('User-Agent', 'PostmanRuntime/7.40.0')
  //     .set('Accept', '*/*')
  //     .set('Cache-Control', 'no-cache')
  //     .set('Postman-Token', '67bdd903-9c93-4c8a-bf5b-0e0072c22f28')
  //     .set('Host', 'localhost:3000')
  //     .set('Accept-Encoding', 'gzip, deflate, br')
  //     .set('Connection', 'keep-alive')
  //     .set(
  //       'Content-Type',
  //       'multipart/form-data; boundary=--------------------------147778240219837777371846',
  //     )
  //     .attach('file', testFilePath);

  //   console.log('Response:', response.body);

  //   expect(response.body).toEqual({
  //     message: 'File uploaded successfully',
  //     file: { url: `${mockDestination}/${mockFilename}` },
  //   });

  //   // Clean up created file from the test directory
  //   fs.unlinkSync(testFilePath);

  //   // Clean up the uploaded file from the uploads directory
  //   const uploadedFilePath = path.join(
  //     __dirname,
  //     `../${mockDestination}/${mockFilename}`,
  //   );
  //   if (fs.existsSync(uploadedFilePath)) {
  //     fs.unlinkSync(uploadedFilePath);
  //   }
  // });

  // it('/files/upload-file (POST); for empty file check', async () => {
  //   const mockDestination = 'uploads';
  //   const mockFilename = 'empty.txt';

  //   const response = await request(app.getHttpServer())
  //     .post(
  //       `/files/upload-file?destination=${mockDestination}&filename=${mockFilename}`,
  //     )
  //     .attach('file', Buffer.from(' '), mockFilename);

  //   console.log('Response:', response.body);

  //   expect(response.body).toEqual({
  //     statusCode: 400,
  //     message: 'empty file uploads are not allowed',
  //   });
  // });
});
