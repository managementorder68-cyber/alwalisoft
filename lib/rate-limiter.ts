/**
 * Simple rate limiter for API routes
 * Use Redis-based rate limiting in production
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry>;
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.limits = new Map();
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Check if request is allowed
   */
  check(identifier: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const entry = this.limits.get(identifier);

    // No entry or expired window - allow and create new entry
    if (!entry || now > entry.resetAt) {
      const resetAt = now + this.windowMs;
      this.limits.set(identifier, {
        count: 1,
        resetAt
      });
      
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetAt
      };
    }

    // Check if limit exceeded
    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetAt
      };
    }

    // Increment count
    entry.count++;
    
    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetAt: entry.resetAt
    };
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    this.limits.delete(identifier);
  }

  /**
   * Clear all rate limits
   */
  clear(): void {
    this.limits.clear();
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetAt) {
        this.limits.delete(key);
      }
    }
  }
}

// Global rate limiter instances
const rateLimiters = {
  api: new RateLimiter(100, 60000), // 100 requests per minute
  game: new RateLimiter(10, 60000), // 10 games per minute
  auth: new RateLimiter(5, 300000), // 5 attempts per 5 minutes
};

// Cleanup every minute
if (typeof window === 'undefined') {
  setInterval(() => {
    Object.values(rateLimiters).forEach(limiter => limiter.cleanup());
  }, 60000);
}

/**
 * Rate limit middleware for API routes
 */
export function rateLimit(
  identifier: string,
  type: 'api' | 'game' | 'auth' = 'api'
): { allowed: boolean; remaining: number; resetAt: number } {
  return rateLimiters[type].check(identifier);
}

/**
 * Get rate limiter instance
 */
export function getRateLimiter(type: 'api' | 'game' | 'auth' = 'api'): RateLimiter {
  return rateLimiters[type];
}

export default rateLimiters;
