import { RedisClientType } from "redis";

export interface RedisStoreDTO {
    name: 'redis';
    getClient: () => RedisClientType;
    isCacheableValue: (value: unknown) => boolean; 
  }
  
export interface RedisCacheDTO extends Cache {
    store: RedisStoreDTO;
  }