import { PrismaClient } from '@prisma/client';

// Global Prisma instance for development (prevents too many connections)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Helper function to safely disconnect Prisma
 */
export async function disconnectPrisma(client: PrismaClient) {
  try {
    await client.$disconnect();
  } catch (error) {
    console.error('Error disconnecting Prisma:', error);
  }
}

/**
 * Execute a function with Prisma client and auto-disconnect
 */
export async function withPrisma<T>(
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  const client = new PrismaClient();
  try {
    return await callback(client);
  } finally {
    await disconnectPrisma(client);
  }
}

/**
 * Retry logic for database operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.code === 'P2002' || error.code === 'P2025') {
        throw error;
      }
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
}

export default prisma;
