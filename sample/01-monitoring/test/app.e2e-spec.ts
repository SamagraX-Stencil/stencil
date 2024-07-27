import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication, Logger } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { ResponseTimeInterceptor } from '@samagra-x/stencil';
import { delay } from 'rxjs';
import { ConfigService } from '@nestjs/config';

describe('ResponseTimeInterceptor (Integration)', () => {
  
  let app: INestApplication;
  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
  };
  let configService: ConfigService;
  let grafanaBaseURL: string;
  let apiToken : string;

  beforeAll(async () => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(mockLogger.log);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(mockLogger.error);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], 
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
     configService = app.get(ConfigService);
     grafanaBaseURL = configService.get<string>('GRAFANA_BASE_URL');
     apiToken = configService.get<string>('GRAFANA_API_TOKEN');
  
  });
  afterAll(async () => {
    await app.close();
  });

// it('should log sucessfull message of the logger', async () => {
//    expect(mockLogger.log).toHaveBeenCalledWith(
//      expect.stringContaining('Successfully added histogram to dashboard!')
//    );
//    console.log(mockLogger.log.mock.calls); 
// });

  it('should contain only controller level interceptor response', async () => {
    
    const metrics = await request(app.getHttpServer())
      .get('/metrics')
      .expect(200);
    expect(metrics.text).toContain('controller_response_time');
  });

  it('should contain both controller and global level interceptor response', async () => {
    
    app.useGlobalInterceptors(
      new ResponseTimeInterceptor(
        'global',
        grafanaBaseURL,
        apiToken,
      ),
    );

    const metrics = await request(app.getHttpServer())
      .get('/metrics')
      .expect(200);
    expect(metrics.text).toContain('global_response_time');
    expect(metrics.text).toContain('controller_response_time');

  });

});
