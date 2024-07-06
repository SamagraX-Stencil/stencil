import { MonitoringService } from '../../src/monitoring/monitoring.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Counter, register } from 'prom-client';

describe('MonitoringService', () => {
  let service: MonitoringService;
  let cacheManagerMock: any;
  let redisClientMock: any;

  beforeEach(() => {
    // Clear Prometheus registry to avoid duplicate metric registration
    register.clear();

    // Mock Redis Client
    redisClientMock = {
      incr: jest.fn(),
    };

    // Mock CACHE_MANAGER
    cacheManagerMock = {
      get: jest.fn().mockResolvedValue('0'),
      set: jest.fn(),
      del: jest.fn(),
      reset: jest.fn(),
      wrap: jest.fn(),
      keys: jest.fn(),
      ttl: jest.fn(),
      store: {
        getClient: jest.fn().mockReturnValue(redisClientMock),
      },
    };

    // Mock Counter
    const counterMock = {
      inc: jest.fn(),
      get: jest.fn().mockReturnValue({ values: [{ value: 0 }] }),
    };

    service = new MonitoringService(cacheManagerMock);
    (service as any).requestCounter = counterMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initializeAsync', () => {
    it('should initialize the counter with the cached value', async () => {
      await service.initializeAsync();

      expect(cacheManagerMock.get).toHaveBeenCalledWith('requestCount');
      expect((service as any).requestCounter.inc).toHaveBeenCalledWith(0);
    });
  });

  describe('getRequestCounter', () => {
    it('should return the cached request count', async () => {
      const count = await service.getRequestCounter();

      expect(cacheManagerMock.get).toHaveBeenCalledWith('requestCount');
      expect(count).toBe('0');
    });
  });

  describe('incrementRequestCounter', () => {
    it('should increment the request counter and update the cache', async () => {
      await service.incrementRequestCounter();

      expect((service as any).requestCounter.inc).toHaveBeenCalled();
      expect(cacheManagerMock.store.getClient).toHaveBeenCalled();
      expect(redisClientMock.incr).toHaveBeenCalledWith('requestCount');
    });
  });

  describe('onExit', () => {
    it('should increment the request counter on exit', async () => {
      jest.spyOn(service, 'incrementRequestCounter').mockResolvedValue();

      await service.onExit();

      expect(service.incrementRequestCounter).toHaveBeenCalled();
    });

    it('should log an error if incrementRequestCounter fails', async () => {
      jest
        .spyOn(service, 'incrementRequestCounter')
        .mockRejectedValue(new Error('Test Error'));
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.onExit();

      expect(consoleSpy).toHaveBeenCalledWith(new Error('Test Error'));
    });
  });
});
