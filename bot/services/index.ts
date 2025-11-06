import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../utils/logger';

export interface Services {
  prisma: PrismaClient;
  redis: Redis;
}

let prisma: PrismaClient;
let redis: Redis;

export async function initializeServices(): Promise<Services> {
  // Initialize Prisma
  if (!prisma) {
    prisma = new PrismaClient({
      log: config.isDevelopment ? ['query', 'error', 'warn'] : ['error'],
    });

    try {
      await prisma.$connect();
      logger.info('✅ Connected to database via Prisma');
    } catch (error: any) {
      logger.error({ err: error }, '❌ Failed to connect to database');
      throw error;
    }
  }

  // Initialize Redis (optional)
  if (!redis) {
    try {
      redis = new Redis(config.redisUrl, {
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        retryStrategy() {
          return null; // Don't retry
        },
        lazyConnect: true,
      });

      await redis.connect().catch(() => {
        logger.warn('⚠️  Redis not available - bot will work without caching');
        redis = null as any;
      });

      if (redis) {
        redis.on('connect', () => {
          logger.info('✅ Connected to Redis');
        });

        redis.on('error', () => {
          // Silently ignore
        });
      }
    } catch (error) {
      logger.warn('⚠️  Redis not available - bot will work without caching');
      redis = null as any;
    }
  }

  return { prisma, redis };
}

export function getPrisma(): PrismaClient {
  if (!prisma) {
    throw new Error('Prisma not initialized. Call initializeServices first.');
  }
  return prisma;
}

export function getRedis(): Redis {
  if (!redis) {
    throw new Error('Redis not initialized. Call initializeServices first.');
  }
  return redis;
}
