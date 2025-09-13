class ConversationManager {
    constructor(redisClient, logger) {
        this.redis = redisClient.getClient();
        this.logger = logger;
        this.conversationTTL = 3600; // 1 hour
        this.historyTTL = 7200; // 2 hours
        this.maxHistoryItems = 10;
    }

    async storeConversationState(userId, query, analysis, response) {
        try {
            const conversationKey = `conversation:${userId}`;
            const conversationData = {
                lastQuery: query,
                lastIntent: analysis.analysis?.intent?.type,
                lastDomains: analysis.analysis?.domains?.map(d => d.type) || [],
                lastEntities: analysis.analysis?.entities || {},
                lastAgents: response.map(r => r.agent),
                timestamp: new Date().toISOString(),
                sessionActive: true
            };
            
            await this.redis.setEx(conversationKey, this.conversationTTL, JSON.stringify(conversationData));
            await this.addToHistory(userId, query, analysis, response);
            
            this.logger.debug('Conversation state stored', { userId, conversationKey });
            
        } catch (error) {
            this.logger.error('Failed to store conversation state', { 
                userId, 
                error: error.message 
            });
        }
    }

    async addToHistory(userId, query, analysis, response) {
        try {
            const historyKey = `history:${userId}`;
            const historyItem = {
                query,
                intent: analysis.analysis?.intent?.type,
                domains: analysis.analysis?.domains?.map(d => d.type) || [],
                agents: response.map(r => r.agent),
                timestamp: new Date().toISOString()
            };
            
            await this.redis.lPush(historyKey, JSON.stringify(historyItem));
            await this.redis.lTrim(historyKey, 0, this.maxHistoryItems - 1);
            await this.redis.expire(historyKey, this.historyTTL);
            
        } catch (error) {
            this.logger.error('Failed to store conversation history', { 
                userId, 
                error: error.message 
            });
        }
    }

    async getConversationState(userId) {
        try {
            const conversationKey = `conversation:${userId}`;
            const data = await this.redis.get(conversationKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            this.logger.error('Failed to get conversation state', { 
                userId, 
                error: error.message 
            });
            return null;
        }
    }

    async getConversationHistory(userId) {
        try {
            const historyKey = `history:${userId}`;
            const historyData = await this.redis.lRange(historyKey, 0, -1);
            return historyData.map(item => JSON.parse(item));
        } catch (error) {
            this.logger.error('Failed to get conversation history', { 
                userId, 
                error: error.message 
            });
            return [];
        }
    }

    async clearConversationState(userId) {
        try {
            const conversationKey = `conversation:${userId}`;
            await this.redis.del(conversationKey);
            this.logger.debug('Conversation state cleared', { userId });
        } catch (error) {
            this.logger.error('Failed to clear conversation state', { 
                userId, 
                error: error.message 
            });
        }
    }

    async getActiveConversationCount() {
        try {
            const keys = await this.redis.keys('conversation:*');
            return keys.length;
        } catch (error) {
            this.logger.error('Failed to get active conversation count', { 
                error: error.message 
            });
            return 0;
        }
    }
}

module.exports = ConversationManager;
