import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { Test, TestingModule } from '@nestjs/testing';
import { Histogram } from 'prom-client';
import { performance } from 'perf_hooks';
import { ResponseTimeInterceptor } from '../../src/interceptors/response-time.interceptor';

// Mock dependencies
jest.mock('prom-client', () => {
  const labels = jest.fn().mockReturnThis();
  const observe = jest.fn();
  return {
    Histogram: jest.fn().mockImplementation(() => ({
      labels,
      observe,
    })),
    exponentialBuckets: jest.fn().mockImplementation(() => [1, 2, 3, 4, 5]),
  };
});

jest.mock('perf_hooks', () => ({
  performance: {
    now: jest.fn(),
  },
}));

describe('ResponseTimeInterceptor', () => {
  let interceptor: ResponseTimeInterceptor;
  let mockHistogram: Histogram;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  
  const grafanaUrl = 'http://localhost:7889';
  const grafanaToken = '<GRAFANA_TOKEN>';
  const histogramTitle = 'test_histogram';

  beforeEach(async () => {
    mockHistogram = new (jest.requireMock('prom-client').Histogram as jest.Mock)();
  
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ResponseTimeInterceptor,
          useFactory: () => new ResponseTimeInterceptor(histogramTitle, grafanaUrl, grafanaToken),
        },
      ],
    }).compile();

    interceptor = module.get<ResponseTimeInterceptor>(ResponseTimeInterceptor);

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ url: '/test' }),
        getResponse: jest.fn().mockReturnValue({ statusCode: 200 }),
      }),
    } as unknown as ExecutionContext;

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of('test')),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should log response time on successful request', async () => {
    (performance.now as jest.Mock)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(100);

    await interceptor.intercept(mockExecutionContext, mockCallHandler).toPromise();

    expect(mockHistogram.labels).toHaveBeenCalledWith({
      statusCode: 200,
      endpoint: '/test',
    });
  });

  it('should log response time and error on failed request', async () => {
    const error = new Error('Test Error') as Error & { status: number };
    error.status = 500;
    mockCallHandler.handle = jest.fn().mockReturnValue(throwError(() => error));

    (performance.now as jest.Mock)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(200);

    await expect(interceptor.intercept(mockExecutionContext, mockCallHandler).toPromise()).rejects.toThrow('Test Error');

    expect(mockHistogram.labels).toHaveBeenCalledWith({
      statusCode: 500,
      endpoint: '/test',
    });    
  });

});
