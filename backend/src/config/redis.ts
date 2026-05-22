import { ConnectionOptions } from 'bullmq';

export const getRedisConnection = (): ConnectionOptions => {
  if (process.env.REDIS_URL) {
    try {
      const parsed = new URL(process.env.REDIS_URL);
      const isTls = parsed.protocol === 'rediss:';
      
      return {
        host: parsed.hostname || '127.0.0.1',
        port: parsed.port ? parseInt(parsed.port, 10) : 6379,
        username: parsed.username || undefined,
        password: parsed.password || undefined,
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
