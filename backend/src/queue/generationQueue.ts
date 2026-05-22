import { Queue } from 'bullmq';
import { getRedisConnection } from '../config/redis';

const connection = getRedisConnection();

export const assessmentQueue = new Queue('question-generation', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
