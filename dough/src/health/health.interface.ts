export interface PostgresConnectionDetails {
    name: string;
    type: 'postgres';
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  }
  
  export interface FusionAuthConnectionDetails {
    healthEndpoint: string;
  }
  
  export interface RedisConnectionDetails {
    host: string;
    port: number;
  }
  