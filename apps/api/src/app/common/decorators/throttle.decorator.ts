import { Throttle, SkipThrottle } from '@nestjs/throttler';

/**
 * Apply strict rate limiting for auth endpoints
 * 5 requests per 60 seconds
 */
export const AuthThrottle = () =>
  Throttle({
    default: {
      limit: 5,
      ttl: 60000,
    },
  });

/**
 * Apply relaxed rate limiting for public endpoints
 * 100 requests per 60 seconds
 */
export const PublicThrottle = () =>
  Throttle({
    default: {
      limit: 100,
      ttl: 60000,
    },
  });

/**
 * Skip rate limiting entirely
 */
export const NoThrottle = () => SkipThrottle();
