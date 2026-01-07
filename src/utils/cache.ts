import NodeCache from 'node-cache';

/**
 * Simple in-memory cache for frequently accessed data
 * TTL (Time To Live) is set in seconds
 */
class CacheService {
    private cache: NodeCache;

    constructor() {
        // Initialize cache with default TTL of 5 minutes
        this.cache = new NodeCache({
            stdTTL: 300, // 5 minutes
            checkperiod: 60, // Check for expired keys every 60 seconds
            useClones: false // Don't clone objects for better performance
        });
    }

    /**
     * Get value from cache
     */
    get<T>(key: string): T | undefined {
        return this.cache.get<T>(key);
    }

    /**
     * Set value in cache with optional custom TTL
     */
    set<T>(key: string, value: T, ttl?: number): boolean {
        if (ttl) {
            return this.cache.set(key, value, ttl);
        }
        return this.cache.set(key, value);
    }

    /**
     * Delete value from cache
     */
    del(key: string): number {
        return this.cache.del(key);
    }

    /**
     * Delete multiple keys from cache
     */
    delMultiple(keys: string[]): number {
        return this.cache.del(keys);
    }

    /**
     * Clear all cache
     */
    flush(): void {
        this.cache.flushAll();
    }

    /**
     * Get cache statistics
     */
    getStats() {
        return this.cache.getStats();
    }

    /**
     * Check if key exists in cache
     */
    has(key: string): boolean {
        return this.cache.has(key);
    }
}

// Export singleton instance
export const cacheService = new CacheService();

// Cache key generators for consistency
export const CacheKeys = {
    departments: () => 'departments:all',
    department: (id: string) => `department:${id}`,
    userRoles: () => 'user:roles',
    requestStatuses: () => 'request:statuses',
    adminFallback: () => 'admin:fallback',
};
