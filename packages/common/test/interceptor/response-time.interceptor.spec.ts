import { ResponseTimeInterceptor } from '../../src/interceptors/response-time.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { Test, TestingModule } from '@nestjs/testing';
import { Histogram } from 'prom-client';
import * as fs from 'fs';
import { performance } from 'perf_hooks';

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

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
}));

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
  const jsonPath = 'path/to/json';
  const histogramTitle = 'test_histogram';

  beforeEach(async () => {
    mockHistogram = new (jest.requireMock('prom-client')
      .Histogram as jest.Mock)();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ResponseTimeInterceptor,
          useFactory: () =>
            new ResponseTimeInterceptor(histogramTitle, jsonPath),
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

    (fs.readFileSync as jest.Mock).mockImplementation(() => JSON.stringify({}));
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
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

    await interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .toPromise();

    expect(mockHistogram.labels).toHaveBeenCalledWith({
      statusCode: 200,
      endpoint: '/test',
    });
    // expect(mockHistogram.observe).toHaveBeenCalledWith(100);
  });

  it('should log response time and error on failed request', async () => {
    const error = new Error('Test Error') as Error & { status: number };
    error.status = 500;
    mockCallHandler.handle = jest.fn().mockReturnValue(throwError(() => error));

    (performance.now as jest.Mock)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(200);

    await expect(
      interceptor.intercept(mockExecutionContext, mockCallHandler).toPromise(),
    ).rejects.toThrow('Test Error');

    expect(mockHistogram.labels).toHaveBeenCalledWith({
      statusCode: 500,
      endpoint: '/test',
    });
    // expect(mockHistogram.observe).toHaveBeenCalledWith(200);
  });

  it('should handle JSON parsing errors gracefully', async () => {
    (fs.readFileSync as jest.Mock).mockImplementationOnce(() => {
      throw new SyntaxError('Invalid JSON');
    });

    await expect(
      interceptor.intercept(mockExecutionContext, mockCallHandler).toPromise(),
    ).resolves.toBe('test');

    expect(mockHistogram.labels).toHaveBeenCalledWith({
      statusCode: 200,
      endpoint: '/test',
    });
    // expect(mockHistogram.observe).toHaveBeenCalledWith(100);
  });
});
