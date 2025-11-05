import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const checks = {
      database: false,
      redis: false,
      timestamp: new Date().toISOString(),
    };

    // Check database
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = true;
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    // Check Redis (optional)
    try {
      if (redis) {
        await redis.ping();
        checks.redis = true;
      }
    } catch (error) {
      console.error('Redis health check failed:', error);
    }

    const healthy = checks.database; // Redis is optional

    if (healthy) {
      return successResponse(checks, 'All systems operational');
    } else {
      return errorResponse('System health check failed', 503);
    }
  } catch (error) {
    console.error('Health check error:', error);
    return errorResponse('Health check failed', 500);
  }
}
