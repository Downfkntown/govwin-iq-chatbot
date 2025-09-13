const { DatabaseConfig, RedisClient, Logger } = require('./lib/infrastructure');
const { BasicCSMCoordinator } = require('./lib/basic-csm-coordinator');

async function testCSM() {
    const dbConfig = new DatabaseConfig();
    const appConfig = { 
        get: () => ({}), 
        getAll: () => ({})
    };
    const logger = new Logger('info');
    const redisClient = new RedisClient(dbConfig.getRedisConfig());
    
    try {
        await redisClient.connect();
        console.log('✅ Connected to Redis');
        
        const csm = new BasicCSMCoordinator(redisClient, logger, appConfig);
        console.log('✅ CSM Coordinator initialized');
        
        // Test 1: Federal opportunity search
        console.log('\n--- Test 1: Federal Query ---');
        const result1 = await csm.processQuery(
            "Find federal IT opportunities", 
            "test_user_1"
        );
        console.log('Response:', result1.csmGuidance[0].content.substring(0, 100) + '...');
        
        // Test 2: Technical support
        console.log('\n--- Test 2: Technical Support ---');
        const result2 = await csm.processQuery(
            "I can't find the search filters", 
            "test_user_2"
        );
        console.log('Response:', result2.csmGuidance[0].content.substring(0, 100) + '...');
        
        // Test 3: Ambiguous query (should ask for clarification)
        console.log('\n--- Test 3: Ambiguous Query ---');
        const result3 = await csm.processQuery(
            "Find opportunities", 
            "test_user_3"
        );
        console.log('Response:', result3.csmGuidance[0].content.substring(0, 100) + '...');
        
        // Test 4: Cache test (same query as Test 1)
        console.log('\n--- Test 4: Cache Test ---');
        const result4 = await csm.processQuery(
            "Find federal IT opportunities", 
            "test_user_1"
        );
        console.log('From cache:', result4.fromCache);
        
        // Check metrics
        const metrics = await csm.getMetrics();
        console.log('\n--- System Metrics ---');
        console.log('Total queries:', metrics.totalQueries);
        console.log('Cache hits:', metrics.cacheHits);
        console.log('Active conversations:', metrics.activeConversations);
        console.log('Average latency:', Math.round(metrics.averageLatency), 'ms');
        
        await redisClient.disconnect();
        console.log('\n✅ CSM system test completed successfully!');
        
    } catch (error) {
        console.error('❌ CSM test failed:', error.message);
        console.error(error.stack);
    }
}

testCSM();
