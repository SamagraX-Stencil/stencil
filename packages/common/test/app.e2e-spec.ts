import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

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


    expect(response.body).toEqual({
      statusCode: 400,
      message: 'empty file uploads are not allowed',
    });
  });
});

describe('Tests for correct setup and functioning of file upload service', () => {
  let app: INestApplication;
  const OLD_ENV = process.env;

  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('Throws error if process.env.STORAGE_ENDPOINT is not set up', async () => {
    process.env.STORAGE_ENDPOINT = 'this/path/does/not/exist';
    try {
      await app.init();
    } catch (error) {
      expect(error.name).toBe('InternalServerErrorException');
      expect(error.message).toBe(
        'Storage location does not exist. Make sure this location is present and accessible by the application.',
      );
    }
  });

  it('should allow empty destination parameter and store in root of STORAGE_ENDPOINT', async () => {
    const response = await request(app.getHttpServer())
      .post(`/files/upload-file`)
      .query({ filename: 'test.txt' })
      .query({ destination: '' })
      .attach('file', Buffer.from('content'), 'test.txt');
    console.log(response.status);
    expect(response.status).toBe(201);
  });

  it('throws error if destination does not exist', async () => {
    const mockDestination = 'notUploads';
    const mockFilename = 'content.txt';

    try {
      await request(app.getHttpServer())
        .post(
          `/files/upload-file?destination=${mockDestination}&filename=${mockFilename}`,
        )
        .attach('file', Buffer.from('content'), mockFilename);
    } catch (error) {
      expect(error.message).toBe(
        'Given destination path does not exist. Please create one.',
      );
    }
  });
});
