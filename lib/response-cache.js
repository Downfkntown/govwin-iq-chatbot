class ResponseCache {
    constructor(redisClient, logger) {
        this.redis = redisClient.getClient();
        this.logger = logger;
        this.defaultTTL = 300; // 5 minutes
        this.cacheKeyPrefix = 'cache:response:';
    }

    generateCacheKey(query, userId, sessionContext = {}) {
        const crypto = require('crypto');
        
        const normalizedQuery = query.toLowerCase().trim();
        
        const contextForHash = {
            userPreferences: sessionContext.userPreferences || {},
            market: sessionContext.preferredMarket || null
        };
        
        const contextHash = crypto
            .createHash('md5')
            .update(JSON.stringify(contextForHash))
            .digest('hex')
            .substring(0, 8);
        
        const queryHash = crypto
            .createHash('md5')
            .update(normalizedQuery)
            .digest('hex')
            .substring(0, 12);
        
        return `${this.cacheKeyPrefix}${queryHash}:${contextHash}`;
    }

    async getFromCache(cacheKey) {
        try {
            const cached = await this.redis.get(cacheKey);
            
            if (cached) {
                const parsed = JSON.parse(cached);
                
                this.logger.debug('Cache hit', { cacheKey });
                
                return {
                    ...parsed,
                    fromCache: true,
                    cachedAt: parsed.timestamp
                };
            }
            
            this.logger.debug('Cache miss', { cacheKey });
            return null;
            
        } catch (error) {
            this.logger.warn('Cache read failed', { 
                cacheKey, 
                error: error.message 
            });
            return null;
        }
    }

    async cacheResponse(cacheKey, response, ttl = this.defaultTTL) {
        try {
            if (response.systemError || response.escalationSuggested) {
                return;
            }
            
            const cacheData = {
                ...response,
                cachedAt: new Date().toISOString()
            };
            
            await this.redis.setEx(cacheKey, ttl, JSON.stringify(cacheData));
            
            this.logger.debug('Response cached', { cacheKey, ttl });
            
        } catch (error) {
            this.logger.warn('Cache write failed', { 
                cacheKey, 
                error: error.message 
            });
        }
    }

    async clearCachePattern(pattern) {
        try {
            const keys = await this.redis.keys(`${this.cacheKeyPrefix}${pattern}`);
            
            if (keys.length > 0) {
                await this.redis.del(...keys);
                this.logger.info('Cache cleared', { pattern, clearedCount: keys.length });
            }
            
            return keys.length;
            
        } catch (error) {
            this.logger.error('Failed to clear cache', { 
                pattern, 
                error: error.message 
            });
            return 0;
        }
    }

    async getCacheStats() {
        try {
            const keys = await this.redis.keys(`${this.cacheKeyPrefix}*`);
            
            return {
                totalKeys: keys.length,
                memoryUsage: keys.length * 1000 // rough estimate
            };
            
        } catch (error) {
            this.logger.error('Failed to get cache stats', { error: error.message });
            return { totalKeys: 0, memoryUsage: 0 };
        }
    }
}

module.exports = ResponseCache;
