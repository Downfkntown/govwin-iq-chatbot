const ConversationManager = require('./conversation-manager');
const ResponseCache = require('./response-cache');
const SimpleExistingBridge = require('./simple-existing-bridge');

class SimpleIntegratedCSMCoordinator {
    constructor(redisClient, logger, config) {
        this.logger = logger;
        this.config = config;
        
        this.conversationManager = new ConversationManager(redisClient, logger);
        this.responseCache = new ResponseCache(redisClient, logger);
        this.existingAgentBridge = new SimpleExistingBridge(logger);
        
        this.metrics = {
            totalQueries: 0,
            successfulQueries: 0,
            failedQueries: 0,
            cacheHits: 0,
            cacheMisses: 0,
            averageLatency: 0,
            recentLatencies: []
        };
    }

    async processQuery(query, userId = 'default', sessionContext = {}) {
        const startTime = Date.now();
        const queryId = this.generateQueryId();
        
        try {
            this.logger.info('Processing query with simple integration', { queryId, userId, query });
            
            // Check cache first
            const cacheKey = this.responseCache.generateCacheKey(query, userId, sessionContext);
            const cachedResponse = await this.responseCache.getFromCache(cacheKey);
            
            if (cachedResponse) {
                this.metrics.cacheHits++;
                this.recordMetrics(true, Date.now() - startTime);
                return cachedResponse;
            }
            
            this.metrics.cacheMisses++;
            
            // Get conversation context
            const conversationState = await this.conversationManager.getConversationState(userId);
            const conversationHistory = await this.conversationManager.getConversationHistory(userId);
            
            // Enhanced NLU analysis
            const analysis = this.performEnhancedNLU(query, conversationState, conversationHistory);
            
            // Process through simple existing agent bridge
            const agentResponses = await this.existingAgentBridge.processWithExistingAgents(
                query, 
                analysis, 
                sessionContext
            );
            
            // Format response
            const response = this.formatCSMResponse(analysis, agentResponses, queryId);
            
            // Store conversation state
            await this.conversationManager.storeConversationState(
                userId, 
                query, 
                analysis, 
                agentResponses
            );
            
            // Cache successful responses
            if (!response.systemError && !response.escalationSuggested) {
                await this.responseCache.cacheResponse(cacheKey, response);
            }
            
            this.recordMetrics(true, Date.now() - startTime);
            this.logger.info('Query processed with simple integration', { queryId, latency: Date.now() - startTime });
            
            return response;
            
        } catch (error) {
            this.recordMetrics(false, Date.now() - startTime);
            this.logger.error('Simple integration query processing failed', { 
                queryId, userId, query, error: error.message 
            });
            return this.createGracefulDegradationResponse(query, userId, error);
        }
    }

    performEnhancedNLU(query, conversationState, conversationHistory) {
        const queryLower = query.toLowerCase();
        
        let intent = 'GENERAL_INQUIRY';
        let confidence = 0.5;
        let targetAgent = null;
        
        // Enhanced intent detection
        if (queryLower.includes('find') || queryLower.includes('search') || queryLower.includes('opportunities')) {
            intent = 'FIND_OPPORTUNITIES';
            confidence = 0.8;
            
            if (queryLower.includes('federal')) {
                targetAgent = 'federal-opportunities';
            } else if (queryLower.includes('state') || queryLower.includes('local') || queryLower.includes('education')) {
                targetAgent = 'sled-markets';
            }
        } else if (queryLower.includes('alert') || queryLower.includes('monitor')) {
            intent = 'SET_ALERTS';
            confidence = 0.9;
            targetAgent = 'alert-manager';
        } else if (queryLower.includes('report') || queryLower.includes('analysis')) {
            intent = 'GENERATE_REPORT';
            confidence = 0.85;
            targetAgent = 'report-generator';
        } else if (queryLower.includes('help') || queryLower.includes("can't") || queryLower.includes('support')) {
            intent = 'TECHNICAL_SUPPORT';
            confidence = 0.8;
            targetAgent = 'search-orchestrator';
        }
        
        // Domain detection
        const domains = [];
        if (queryLower.includes('federal') || queryLower.includes('government')) {
            domains.push({ type: 'FEDERAL', confidence: 0.9 });
        }
        if (queryLower.includes('state') || queryLower.includes('local') || queryLower.includes('education')) {
            domains.push({ type: 'SLED', confidence: 0.9 });
        }
        
        // Entity extraction
        const entities = {
            industry: this.extractIndustries(queryLower),
            location: this.extractLocations(queryLower),
            agency: this.extractAgencies(queryLower),
            budget: this.extractBudget(queryLower)
        };
        
        return {
            query,
            analysis: {
                intent: { type: intent, confidence },
                domains,
                entities,
                targetAgent,
                confidence: Math.min(confidence + (entities.industry.length * 0.1), 0.95)
            },
            routing: {
                primaryAgent: targetAgent,
                requiresClarification: domains.length > 1
            },
            conversationState,
            conversationHistory
        };
    }

    extractIndustries(query) {
        const industries = [];
        if (query.includes('cyber') || query.includes('security')) industries.push('cybersecurity');
        if (query.includes('it') || query.includes('technology')) industries.push('technology');
        if (query.includes('construction')) industries.push('construction');
        if (query.includes('healthcare')) industries.push('healthcare');
        if (query.includes('education')) industries.push('education');
        return industries;
    }

    extractLocations(query) {
        const locations = [];
        const locationNames = ['texas', 'california', 'florida', 'new york', 'virginia'];
        locationNames.forEach(loc => {
            if (query.includes(loc)) locations.push(loc);
        });
        return locations;
    }

    extractAgencies(query) {
        const agencies = [];
        const agencyNames = ['dod', 'nasa', 'gsa', 'va', 'dhs'];
        agencyNames.forEach(agency => {
            if (query.includes(agency)) agencies.push(agency);
        });
        return agencies;
    }

    extractBudget(query) {
        const budgetMatch = query.match(/\$?([\d,]+)\s*(million|m|thousand|k)?/);
        if (budgetMatch) {
            let amount = parseInt(budgetMatch[1].replace(/,/g, ''));
            const unit = budgetMatch[2]?.toLowerCase();
            if (unit?.startsWith('m')) amount *= 1000000;
            if (unit?.startsWith('k')) amount *= 1000;
            return amount;
        }
        return null;
    }

    formatCSMResponse(analysis, agentResponses, queryId) {
        return {
            queryId,
            query: analysis.query,
            timestamp: new Date().toISOString(),
            csmGuidance: agentResponses,
            analysis: {
                intent: analysis.analysis.intent.type,
                confidence: analysis.analysis.confidence,
                domains: analysis.analysis.domains.map(d => d.type),
                entities: analysis.analysis.entities,
                targetAgent: analysis.analysis.targetAgent
            },
            escalationSuggested: agentResponses.some(r => r.recommendsHumanHelp),
            fromCache: false,
            availableAgents: this.existingAgentBridge.getAvailableAgents()
        };
    }

    createGracefulDegradationResponse(query, userId, error) {
        return {
            query, userId,
            timestamp: new Date().toISOString(),
            systemError: true,
            csmGuidance: [{
                agent: 'SYSTEM_FALLBACK',
                content: "I'm experiencing high demand right now. Let me connect you with one of our Customer Success Managers who can provide immediate assistance with GovWin IQ navigation.",
                guidanceType: 'system_fallback',
                escalationRequired: true
            }],
            escalationSuggested: true
        };
    }

    recordMetrics(success, latency) {
        this.metrics.totalQueries++;
        if (success) this.metrics.successfulQueries++;
        else this.metrics.failedQueries++;
        
        this.metrics.recentLatencies.push(latency);
        if (this.metrics.recentLatencies.length > 1000) {
            this.metrics.recentLatencies.shift();
        }
        
        this.metrics.averageLatency = this.metrics.recentLatencies.reduce((a, b) => a + b, 0) / this.metrics.recentLatencies.length;
    }

    generateQueryId() {
        return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async getMetrics() {
        const activeConversations = await this.conversationManager.getActiveConversationCount();
        const cacheStats = await this.responseCache.getCacheStats();
        
        return {
            ...this.metrics,
            activeConversations,
            cache: cacheStats,
            availableAgents: this.existingAgentBridge.getAvailableAgents(),
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = SimpleIntegratedCSMCoordinator;
