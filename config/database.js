class DatabaseConfig {
    constructor() {
        this.redisConfig = {
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
            db: 0,
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => Math.min(times * 50, 2000),
            lazyConnect: true,
            keepAlive: 30000,
            connectTimeout: 10000,
            commandTimeout: 5000
        };
    }

    getRedisConfig() {
        return this.redisConfig;
    }
}

module.exports = DatabaseConfig;
