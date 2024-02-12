import { Injectable } from '@nestjs/common';
import axios from 'axios';
import Redis from 'ioredis';
import createRedisHealthcheck from 'redis-healthcheck';

import {
  PostgresConnectionDetails,
  FusionAuthConnectionDetails,
  RedisConnectionDetails,
} from './health.interface';

@Injectable()
export class HealthService {
  async combineHealthChecks(services: string[]): Promise<any> {
    const healthChecks = await Promise.all(services.map((service) => this.runHealthCheck(service)));
    return Object.assign({}, ...healthChecks);
  }

  private async runHealthCheck(service: string): Promise<any> {
    switch (service) {
      case 'postgres':
        return this.checkDatabase({
          name: 'postgres',
          type: 'postgres',
          host: process.env.DATABASE_HOST || 'localhost',
          port: parseInt(process.env.DATABASE_PORT || '5432', 10),
          username: process.env.DATABASE_USERNAME || 'root',
          password: process.env.DATABASE_PASSWORD || 'secret',
          database: process.env.DATABASE_NAME || 'api',
        });

      case 'shadowpostgres':
        return this.checkDatabase({
          name: 'shadow-postgres',
          type: 'postgres',
          host: process.env.SHADOW_DATABASE_HOST || 'localhost',
          port: parseInt(process.env.SHADOW_DATABASE_PORT || '5431', 10),
          username: process.env.SHADOW_DATABASE_USERNAME || 'root',
          password: process.env.SHADOW_DATABASE_PASSWORD || 'secret',
          database: process.env.SHADOW_DATABASE_NAME || 'shadow',
        });
      case 'fusionauth':
        return this.checkFusionAuth({
          healthEndpoint: process.env.FUSIONAUTH_BASE_URL + '/api/status',
        });
      case 'redis':
        return this.checkRedis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
        });
      default:
        return { [service]: { status: 'unknown', message: 'Unknown service' } };
    }
  }

  private async checkDatabase(connectionDetails: PostgresConnectionDetails): Promise<any> {
    try {
      const pgp = require('pg-promise')();
      const db = pgp({
        host: connectionDetails.host,
        port: connectionDetails.port,
        user: connectionDetails.username,
        password: connectionDetails.password,
        database: connectionDetails.database,
      });

      await db.query('SELECT 1');

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
