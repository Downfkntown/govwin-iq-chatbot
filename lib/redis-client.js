const Redis = require('redis');

class RedisClient {
    constructor(config) {
        this.config = config;
        this.client = null;
        this.isConnected = false;
        this.connectionAttempts = 0;
        this.maxConnectionAttempts = 5;
    }

    async connect() {
        try {
            console.log('Connecting to Redis...');
            
            this.client = Redis.createClient(this.config);
            
            this.client.on('error', this.handleError.bind(this));
            this.client.on('connect', this.handleConnect.bind(this));
            this.client.on('ready', this.handleReady.bind(this));
            this.client.on('end', this.handleEnd.bind(this));
            
            await this.client.connect();
            
            const pong = await this.client.ping();
            if (pong !== 'PONG') {
                throw new Error('Redis ping failed');
            }
            
            console.log('Redis connected successfully');
            this.isConnected = true;
            this.connectionAttempts = 0;
            
            return this.client;
            
        } catch (error) {
            this.connectionAttempts++;
            console.error(`Redis connection attempt ${this.connectionAttempts} failed:`, error.message);
            
            if (this.connectionAttempts >= this.maxConnectionAttempts) {
                throw new Error(`Failed to connect to Redis after ${this.maxConnectionAttempts} attempts`);
            }
            
            await this.sleep(2000 * this.connectionAttempts);
            return this.connect();
        }
    }

    handleError(error) {
        console.error('Redis error:', error);
        this.isConnected = false;
    }

    handleConnect() {
        console.log('Redis client connected');
    }

    handleReady() {
        console.log('Redis client ready');
        this.isConnected = true;
    }

    handleEnd() {
        console.log('Redis connection ended');
        this.isConnected = false;
    }

    async disconnect() {
        if (this.client) {
            await this.client.quit();
            this.client = null;
            this.isConnected = false;
        }
    }

    getClient() {
        if (!this.isConnected || !this.client) {
            throw new Error('Redis client not connected');
        }
        return this.client;
    }

    async healthCheck() {
        try {
            if (!this.client || !this.isConnected) {
                return { status: 'disconnected' };
            }
            
            const start = Date.now();
            const result = await this.client.ping();
            const latency = Date.now() - start;
            
            return {
                status: result === 'PONG' ? 'healthy' : 'unhealthy',
                latency,
                connected: this.isConnected
            };
        } catch (error) {
            return {
                status: 'error',
                error: error.message,
                connected: false
            };
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = RedisClient;
