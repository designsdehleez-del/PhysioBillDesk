export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTimeMs: number
  retryAfterSeconds?: number
}

interface RateLimitBucket {
  count: number
  resetTime: number
}

// In-memory sliding window rate limit store
const ipBuckets = new Map<string, RateLimitBucket>()

/**
 * Clean expired buckets every 5 minutes to prevent memory leaks
 */
setInterval(() => {
  const now = Date.now()
  for (const [key, bucket] of ipBuckets.entries()) {
    if (now > bucket.resetTime) {
      ipBuckets.delete(key)
    }
  }
}, 300000)

/**
 * Checks and consumes rate limit quota for a given identifier
 * @param identifier Client IP address or User ID
 * @param limit Maximum allowed requests within the window
 * @param windowSeconds Time window in seconds (default 60s)
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowSeconds: number = 60
): RateLimitResult {
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  const bucketKey = `${identifier}`

  let bucket = ipBuckets.get(bucketKey)

  if (!bucket || now > bucket.resetTime) {
    // Initialize or reset window
    bucket = {
      count: 1,
      resetTime: now + windowMs,
    }
    ipBuckets.set(bucketKey, bucket)
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetTimeMs: bucket.resetTime,
    }
  }

  if (bucket.count < limit) {
    bucket.count += 1
    return {
      success: true,
      limit,
      remaining: limit - bucket.count,
      resetTimeMs: bucket.resetTime,
    }
  }

  // Rate limit exceeded
  const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetTime - now) / 1000))
  return {
    success: false,
    limit,
    remaining: 0,
    resetTimeMs: bucket.resetTime,
    retryAfterSeconds,
  }
}
