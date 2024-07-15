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
      .expect('Hello World from file upload.');
  });

  it('should allow empty destination parameter and store in root of STORAGE_ENDPOINT', async () => {
    // const mockFilename = 'testfile1.txt';
    // const mockDestination = '';

    const response = await request(app.getHttpServer())
      .post(`/files/upload-file`)
      .query({ filename: 'test.txt' })
      .query({ destination: '' })
      .attach('file', Buffer.from('content'), 'test.txt');

    expect(response.body).toEqual({
      message: 'File uploaded successfully',
      file: { url: `/${'test.txt'}` },
    });
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

describe('Test that require mock environment variables', () => {
  let app: INestApplication;
  const OLD_ENV = process.env;

  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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
});
