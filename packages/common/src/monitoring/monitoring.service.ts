import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache, Store } from 'cache-manager';
import { Injectable, Inject } from '@nestjs/common';
import { Counter } from 'prom-client';
import Redis from 'redis';

// https://stackoverflow.com/questions/68117902/how-can-i-get-redis-io-client-from-nestjs-cachemanager-module
interface RedisCache extends Cache {
  store: RedisStore;
}

interface RedisStore extends Store {
  name: 'redis';
  getClient: () => Redis.RedisClientType;
  isCacheableValue: (value: any) => boolean;
}

@Injectable()
export class MonitoringService {
  constructor(@Inject(CACHE_MANAGER) private cache: RedisCache) {}

  async initializeAsync() {
    console.log(
      'Initializing counter on start ',
      (await this.cache.get('requestCount')) || '0',
    );

    await this.requestCounter.inc(
      parseInt((await this.cache.get('requestCount')) || '0'),
    );
  }

  private requestCounter: Counter<string> = new Counter({
    name: 'request_count',
    help: 'total request count',
  });

  public async getRequestCounter() {
    return this.cache.get('requestCount') || 0;
  }

  public async incrementRequestCounter(): Promise<void> {
    this.requestCounter.inc();

    const client = this.cache.store.getClient();
    client.incr('requestCount');
  }

  public async onExit(): Promise<void> {
    console.log(
      'On exit called, exiting and saving the value with ',
      (await this.requestCounter.get()).values[0].value + 1,
    );
    try {
      await this.incrementRequestCounter();
    } catch (err) {
      console.log(err);
    }
  }
}
