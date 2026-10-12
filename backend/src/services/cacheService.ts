import Redis from 'ioredis';

class CacheService {
  private redisClient: Redis | null = null;
  private memoryCache = new Map<string, { value: string; expiresAt: number }>();
  private isRedisConnected = false;

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      try {
        this.redisClient = new Redis(redisUrl, {
          lazyConnect: true,
          retryStrategy: (times) => {
            if (times > 3) return null; // stop reconnecting if unavailable
            return Math.min(times * 100, 2000);
          }
        });

        this.redisClient
          .connect()
          .then(() => {
            this.isRedisConnected = true;
            console.log('⚡ Redis connected successfully for campaign caching.');
          })
          .catch((err) => {
            console.warn('⚠️ Redis connection failed. Falling back to high-performance in-memory cache:', err.message);
            this.isRedisConnected = false;
          });

        this.redisClient.on('error', () => {
          this.isRedisConnected = false;
        });
      } catch (err: any) {
        console.warn('⚠️ Redis initialization error, using in-memory cache:', err.message);
      }
    } else {
      console.log('ℹ️ No REDIS_URL provided. Using built-in TTL in-memory cache.');
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    if (this.isRedisConnected && this.redisClient) {
      try {
        const data = await this.redisClient.get(key);
        if (data) return JSON.parse(data) as T;
      } catch {
        // fallback to memory
      }
    }

    // Memory cache fallback
    const entry = this.memoryCache.get(key);
    if (entry) {
      if (Date.now() < entry.expiresAt) {
        return JSON.parse(entry.value) as T;
      }
      this.memoryCache.delete(key);
    }

    return null;
  }

  public async set(key: string, value: any, ttlSeconds: number = 60): Promise<void> {
    const serialized = JSON.stringify(value);

    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.set(key, serialized, 'EX', ttlSeconds);
      } catch {
        // fallback to memory
      }
    }

    this.memoryCache.set(key, {
      value: serialized,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }

  public async del(key: string): Promise<void> {
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch {
        // ignore
      }
    }
    this.memoryCache.delete(key);
  }

  public async invalidatePattern(patternPrefix: string): Promise<void> {
    if (this.isRedisConnected && this.redisClient) {
      try {
        const keys = await this.redisClient.keys(`${patternPrefix}*`);
        if (keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      } catch {
        // ignore
      }
    }

    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(patternPrefix)) {
        this.memoryCache.delete(key);
      }
    }
  }
}

export const cacheService = new CacheService();
