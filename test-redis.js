const { DatabaseConfig, RedisClient, Logger } = require('./lib/infrastructure');

async function testRedis() {
    const dbConfig = new DatabaseConfig();
    const logger = new Logger('info');
    const redisClient = new RedisClient(dbConfig.getRedisConfig());
    
    try {
        await redisClient.connect();
        const health = await redisClient.healthCheck();
        console.log('Redis Health:', health);
        
        // Test basic operations
        const client = redisClient.getClient();
        await client.set('test_key', 'test_value');
        const value = await client.get('test_key');
        console.log('Redis test value:', value);
        
        await redisClient.disconnect();
        console.log('Redis test completed successfully!');
        
    } catch (error) {
        console.error('Redis test failed:', error.message);
    }
}

testRedis();
