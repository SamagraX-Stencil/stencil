import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication, Logger } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { ResponseTimeInterceptor } from '@samagra-x/stencil';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { execSync } from 'child_process';
import { getDashboardJSON } from '@samagra-x/stencil';

describe('ResponseTimeInterceptor (Integration)', () => {
  
  let app: INestApplication;
  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
  };
  let configService: ConfigService;
  let grafanaBaseURL: string;
  let apiToken: string;

  beforeAll(async () => {
    console.log(process.cwd());
    execSync('cd monitor && docker-compose up -d');

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
  },30000);

  afterAll(async () => {
    await app.close();
    execSync('cd monitor && docker-compose down');
  });

  const getGrafanaDashboardData = async (dashboardUid: string) => {
    const response = await axios.get(
      `${grafanaBaseURL}/api/dashboards/uid/${dashboardUid}`,
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
      },
    );
    return response.data;
  };

  it('should contain only controller level interceptor response under prometheus', async () => {
    
    const metrics = await request(app.getHttpServer())
      .get('/metrics')
      .expect(200);
    expect(metrics.text).toContain('controller_response_time');
  });

  it('should contain both controller and global level interceptor response under prometheus', async () => {
    
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

it('should contain both controller and global level interceptor response under grafana', async () => {
  const dashboardJSONSearchResp = await getDashboardJSON(
    apiToken,
    'Response_Times',
    grafanaBaseURL,
  );
  const dashboardUid =
    dashboardJSONSearchResp.length > 0
      ? dashboardJSONSearchResp[0]['uid']
      : undefined;

  const dashboardData = await getGrafanaDashboardData(dashboardUid);
  const panels = dashboardData.dashboard.panels;

  const globalResponsePanel = panels.find(panel => 
    panel.title === 'Global Response Time'
  );
  expect(globalResponsePanel).toBeDefined();

  const controllerResponsePanel = panels.find(panel => 
    panel.title === 'Controller Response Time'
  );
  expect(controllerResponsePanel).toBeDefined();

 });
 
});
