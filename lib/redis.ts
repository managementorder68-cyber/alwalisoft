import Redis from 'ioredis';

const globalForRedis = global as unknown as { redis: Redis | null };

let redis: Redis | null = null;

try {
  redis = globalForRedis.redis || new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    lazyConnect: true,
    retryStrategy() {
      return null; // Don't retry
    },
  });

  if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;
} catch (error) {
  console.warn('Redis initialization failed, will work without caching');
  redis = null;
}

export { redis };
