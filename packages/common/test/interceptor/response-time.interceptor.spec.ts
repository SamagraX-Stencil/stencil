import { ResponseTimeInterceptor } from '../../src/interceptors/response-time.interceptor';
import {
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { Observable, of, throwError } from 'rxjs';
import { getDashboardByUID, getDashboardJSON, generateBaseJSON, generateRow } from '../../src/interceptors/utils';
import { register } from 'prom-client';

jest.mock('axios');
jest.mock('../../src/interceptors/utils', () => ({
  getDashboardByUID: jest.fn(),
  getDashboardJSON: jest.fn(),
  generateBaseJSON: jest.fn(),
  generateRow: jest.fn(),
}));
interface Dashboard {
  panels?: any[]; 
}

interface ParsedContent {
  dashboard: Dashboard;
}

describe('ResponseTimeInterceptor', () => {
  let responseTimeInterceptor: ResponseTimeInterceptor;
  let logger: Logger;

  beforeEach(async () => {
    register.clear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: Logger,
          useValue: {
            verbose: jest.fn(),
            error: jest.fn(),
            log: jest.fn(),
          },
        },
        {
          provide: ResponseTimeInterceptor,
          useFactory: () =>
            new ResponseTimeInterceptor(
              'test_histogram_test',
              'http://localhost:7889',
              'test_api_token'
            ),
        },
      ],
    }).compile();

    responseTimeInterceptor = module.get<ResponseTimeInterceptor>(ResponseTimeInterceptor);
    logger = module.get<Logger>(Logger);
  });

  it('should call the external API and update dashboard if not present', async () => {
    (getDashboardJSON as jest.Mock).mockResolvedValue([]);

    (generateBaseJSON as jest.Mock).mockReturnValue({
      dashboard: { panels: [] },
    });

    (axios.post as jest.Mock).mockResolvedValue({ data: {} });

    await responseTimeInterceptor.init('test_histogram');
    
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:7889/api/dashboards/db',
      expect.any(Object),
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer test_api_token',
        },
      }
    );

    expect(generateBaseJSON).toHaveBeenCalled();
  });

  it('should retry dashboard update on version mismatch', async () => {
    (getDashboardByUID as jest.Mock).mockResolvedValue({
      dashboard: { title: 'Response Times', version: 1, panels: [] },
    });

    (axios.post as jest.Mock)
      .mockRejectedValueOnce({
        response: { data: { status: 'version-mismatch' } },
      })
      .mockResolvedValueOnce({ data: {} }); 

    await responseTimeInterceptor.init('test_histogram');

    expect(axios.post).toHaveBeenCalledTimes(5);
    expect(axios.post).toHaveBeenNthCalledWith(2, expect.any(String), expect.any(Object), expect.any(Object));
  });

it('should log an error if dashboard update fails', async () => {
  const mockError = new Error('Test error');
  (axios.post as jest.Mock).mockRejectedValueOnce(mockError);

  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  await responseTimeInterceptor.init('test_histogram').catch(() => {});

  expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating Grafana JSON!', expect.any(Error));

  consoleErrorSpy.mockRestore();
});

it('should observe response time in successful requests', () => {
    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ url: '/test-url' }),
        getResponse: jest.fn().mockReturnValue({ statusCode: 200 }),
      }),
    } as unknown as ExecutionContext;

    const callHandler = {
      handle: jest.fn().mockReturnValue(of('test-response')),
    } as unknown as CallHandler;

    jest.spyOn(responseTimeInterceptor['histogram'].labels({ statusCode: 200, endpoint: '/test-url' }), 'observe');

    const result = responseTimeInterceptor.intercept(context, callHandler);
    expect(callHandler.handle).toHaveBeenCalled();
    expect(result).toBeInstanceOf(Observable);

});
it('should set dashboardUid from getDashboardJSON response', async () => {
  const mockUid = 'test-dashboard-uid';
  (getDashboardJSON as jest.Mock).mockResolvedValue([{ uid: mockUid }]);

  await responseTimeInterceptor.init('test_histogram');

  expect(responseTimeInterceptor['dashboardUid']).toBe(mockUid);
});

it('should initialize parsedContent.dashboard.panels as an empty array if it does not exist', async () => {
  (getDashboardJSON as jest.Mock).mockResolvedValue([]); 
  const mockBaseJSON: ParsedContent = { dashboard: {} as Dashboard }; 
  (generateBaseJSON as jest.Mock).mockReturnValue(mockBaseJSON);

  await responseTimeInterceptor.init('test_histogram');

  expect(mockBaseJSON.dashboard.panels).toEqual([]); 
});

  it('should check if panel exists in dashboard', () => {
    const panels = [{ title: 'Test Panel' }, { title: 'Test Histogram Response Time' }];
    const result = responseTimeInterceptor.isPanelPresent(panels, 'test_histogram_response_time');
    expect(result).toBe(true);
  });

  it('should return false if panel does not exist in dashboard', () => {
    const panels = [{ title: 'Some Other Panel' }];
    const result = responseTimeInterceptor.isPanelPresent(panels, 'test_histogram_response_time');
    expect(result).toBe(false);
  });

  it('should successfully update the dashboard', async () => {
    const FINAL_JSON = { dashboard: { title: 'Test Dashboard', version: 1 } };
    (axios.post as jest.Mock).mockResolvedValueOnce({ data: {} });

    await responseTimeInterceptor.updateDashboard(FINAL_JSON);

    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:7889/api/dashboards/db',
      FINAL_JSON,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test_api_token',
        },
      }
    );
  });

});
