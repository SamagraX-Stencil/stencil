import { Store } from 'cache-manager';
import Redis from 'redis'

interface RedisStore extends Store {
    name: 'redis';
    getClient: () => Redis.RedisClientType;
    isCacheableValue: (value: unknown) => boolean; 
}

export { RedisStore }; 