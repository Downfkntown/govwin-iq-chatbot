class AppConfig {
    constructor() {
        this.config = {
            port: process.env.PORT || 3000,
            env: process.env.NODE_ENV || 'development',
            maxConcurrency: parseInt(process.env.MAX_CONCURRENCY) || 100,
            responseTimeout: parseInt(process.env.RESPONSE_TIMEOUT) || 15000,
            cacheTTL: parseInt(process.env.CACHE_TTL) || 300,
            workerPool: parseInt(process.env.WORKER_POOL_SIZE) || 4,
            circuitBreaker: {
                failureThreshold: 5,
                resetTimeout: 30000
            },
            rateLimiting: {
                windowMs: 15 * 60 * 1000,
                max: 100
            },
            logging: {
                level: process.env.LOG_LEVEL || 'info'
            }
        };
    }
    
    get(key) {
        return this.config[key];
    }
    
    getAll() {
        return this.config;
    }
}

module.exports = AppConfig;
