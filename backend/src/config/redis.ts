import { ConnectionOptions } from 'bullmq';
import url from 'url';

export const getRedisConnection = (): ConnectionOptions => {
  if (process.env.REDIS_URL) {
    try {
      const parsed = url.parse(process.env.REDIS_URL);
      const isTls = parsed.protocol === 'rediss:';
      
      return {
        host: parsed.hostname || '127.0.0.1',
        port: parsed.port ? parseInt(parsed.port, 10) : 6379,
        username: parsed.auth ? parsed.auth.split(':')[0] : undefined,
        password: parsed.auth ? parsed.auth.split(':')[1] : undefined,
        tls: isTls ? {} : undefined,
        maxRetriesPerRequest: null, // Critical requirement for BullMQ compatibility
      };
    } catch (e) {
      console.error('Failed to parse REDIS_URL, falling back to host/port config:', e);
    }
  }

  return {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    maxRetriesPerRequest: null, // Critical requirement for BullMQ compatibility
  };
};
