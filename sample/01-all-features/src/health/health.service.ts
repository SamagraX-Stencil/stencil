// health.service.ts

import { Injectable } from '@nestjs/common';
import { getConnection, createConnection, Connection } from 'typeorm';
import axios from 'axios';
import Redis from 'ioredis';
import createRedisHealthcheck from 'redis-healthcheck';

import {
  DatabaseConnectionDetails,
  FusionAuthConnectionDetails,
  RedisConnectionDetails,
} from './health.interface';

@Injectable()
export class HealthService {
    private async checkDatabase(connectionDetails: DatabaseConnectionDetails): Promise<any> {
        try {
          let connection: Connection | undefined;
      
          try {
            connection = getConnection(connectionDetails.name);
          } catch (error) {
            connection = await createConnection({ ...connectionDetails });
          }
      
          await connection.query('SELECT 1');
      
          return { [connectionDetails.name]: { status: 'up' } };
        } catch (error) {
          return { [connectionDetails.name]: { status: 'down', message: error.message } };
        }
      }      

  async checkFusionAuth(connectionDetails: FusionAuthConnectionDetails): Promise<any> {
    try {
      const response = await axios.get(connectionDetails.healthEndpoint);
  
      if (response.status === 200) {
        return { fusionAuth: { status: 'up' } };
      } else {
        throw new Error('FusionAuth health check failed');
      }
    } catch (error) {
      return { fusionAuth: { status: 'down', message: error.message } };
    }
  }

  async checkRedis(connectionDetails: RedisConnectionDetails): Promise<any> {
    try {
      const client = new Redis({
        host: connectionDetails.host,
        port: connectionDetails.port,
      });

      const redisHealthcheck = createRedisHealthcheck({
        client,
        name: 'redis',
        memoryThreshold: 10485760,
      });
      
      await new Promise<void>((resolve, reject) => {
        redisHealthcheck.checkStatus((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      return { redis: { status: 'up' } };
    } catch (error) {
      return { redis: { status: 'down', message: error.message } };
    }
  }
}
