const ConversationManager = require('./conversation-manager');
const ResponseCache = require('./response-cache');

class BasicCSMCoordinator {
    constructor(redisClient, logger, config) {
        this.logger = logger;
        this.config = config;
        
        this.conversationManager = new ConversationManager(redisClient, logger);
        this.responseCache = new ResponseCache(redisClient, logger);
        
        this.agents = new Map();
        this.initializeBasicAgents();
        
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
            this.logger.info('Processing query', { queryId, userId, query });
            
            // Check cache first
            const cacheKey = this.responseCache.generateCacheKey(query, userId, sessionContext);
            const cachedResponse = await this.responseCache.getFromCache(cacheKey);
            
            if (cachedResponse) {
                this.metrics.cacheHits++;
                this.recordMetrics(true, Date.now() - startTime);
                
                this.logger.info('Returning cached response', { queryId, cacheKey });
                return cachedResponse;
            }
            
            this.metrics.cacheMisses++;
            
            // Get conversation context
            const conversationState = await this.conversationManager.getConversationState(userId);
            const conversationHistory = await this.conversationManager.getConversationHistory(userId);
            
            // Basic NLU analysis
            const analysis = this.performBasicNLU(query, conversationState, conversationHistory);
            
            // Route to appropriate agent
            const agentResponses = await this.routeToAgents(analysis);
            
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
            
            // Record metrics
            this.recordMetrics(true, Date.now() - startTime);
            
            this.logger.info('Query processed successfully', { queryId, latency: Date.now() - startTime });
            
            return response;
            
        } catch (error) {
            this.recordMetrics(false, Date.now() - startTime);
            
            this.logger.error('Query processing failed', { 
                queryId, 
                userId, 
                query, 
                error: error.message,
                stack: error.stack
            });
            
            return this.createGracefulDegradationResponse(query, userId, error);
        }
    }

    performBasicNLU(query, conversationState, conversationHistory) {
        const queryLower = query.toLowerCase();
        
        // Basic intent detection
        let intent = 'GENERAL_INQUIRY';
        if (queryLower.includes('find') || queryLower.includes('search') || queryLower.includes('opportunities')) {
            intent = 'FIND_OPPORTUNITIES';
        } else if (queryLower.includes('help') || queryLower.includes("can't") || queryLower.includes('support')) {
            intent = 'TECHNICAL_SUPPORT';
        }
        
        // Basic domain detection
        const domains = [];
        if (queryLower.includes('federal') || queryLower.includes('government')) {
            domains.push({ type: 'FEDERAL', confidence: 0.8 });
        }
        if (queryLower.includes('state') || queryLower.includes('local') || queryLower.includes('education')) {
            domains.push({ type: 'SLED', confidence: 0.8 });
        }
        
        return {
            query,
            analysis: {
                intent: { type: intent, confidence: 0.7 },
                domains,
                entities: { industry: [], location: [], agency: [] },
                confidence: 0.7
            },
            routing: this.determineRouting(intent, domains),
            conversationState,
            conversationHistory
        };
    }

    determineRouting(intent, domains) {
        const routing = {
            primaryAgent: null,
            secondaryAgents: [],
            requiresClarification: false
        };
        
        if (intent === 'TECHNICAL_SUPPORT') {
            routing.primaryAgent = 'TECHNICAL_SUPPORT';
        } else if (domains.length === 1) {
            routing.primaryAgent = domains[0].type === 'FEDERAL' ? 'FEDERAL_DOMAIN' : 'SLED_DOMAIN';
        } else if (domains.length > 1) {
            routing.requiresClarification = true;
            routing.secondaryAgents = ['FEDERAL_DOMAIN', 'SLED_DOMAIN'];
        } else {
            routing.primaryAgent = 'GENERAL_GUIDANCE';
        }
        
        return routing;
    }

    async routeToAgents(analysis) {
        const responses = [];
        const { routing } = analysis;
        
        if (routing.requiresClarification) {
            responses.push(this.generateClarificationResponse(analysis));
        } else if (routing.primaryAgent) {
            const agent = this.agents.get(routing.primaryAgent);
            if (agent) {
                const response = await agent.provideGuidance(analysis.query, analysis);
                responses.push({ ...response, role: 'primary' });
            }
        }
        
        return responses;
    }

    generateClarificationResponse(analysis) {
        return {
            agent: 'CSM_COORDINATOR',
            content: "I'd be happy to help you navigate GovWin IQ! To give you the most relevant guidance, could you tell me if you're interested in federal opportunities (like Department of Defense, NASA) or state and local opportunities (like state governments, school districts)?",
            guidanceType: 'clarification',
            requiresResponse: true,
            role: 'primary'
        };
    }

    initializeBasicAgents() {
        this.agents.set('TECHNICAL_SUPPORT', new BasicTechnicalSupportAgent());
        this.agents.set('FEDERAL_DOMAIN', new BasicFederalGuidanceAgent());
        this.agents.set('SLED_DOMAIN', new BasicSLEDGuidanceAgent());
        this.agents.set('GENERAL_GUIDANCE', new BasicGeneralGuidanceAgent());
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
                domains: analysis.analysis.domains.map(d => d.type)
            },
            escalationSuggested: agentResponses.some(r => r.recommendsHumanHelp),
            fromCache: false
        };
    }

    createGracefulDegradationResponse(query, userId, error) {
        return {
            query,
            userId,
            timestamp: new Date().toISOString(),
            systemError: true,
            csmGuidance: [{
                agent: 'SYSTEM_FALLBACK',
                content: "I'm experiencing high demand right now. Let me connect you with one of our Customer Success Managers who can provide immediate assistance.",
                guidanceType: 'system_fallback',
                escalationRequired: true
            }],
            escalationSuggested: true
        };
    }

    recordMetrics(success, latency) {
        this.metrics.totalQueries++;
        
        if (success) {
            this.metrics.successfulQueries++;
        } else {
            this.metrics.failedQueries++;
        }
        
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
            timestamp: new Date().toISOString()
        };
    }
}

// Basic agent implementations
class BasicTechnicalSupportAgent {
    async provideGuidance(query, analysis) {
        return {
            agent: 'TECHNICAL_SUPPORT',
            content: `I can help you navigate GovWin IQ. What specific feature or task do you need assistance with?`,
            guidanceType: 'technical_support',
            nextSteps: [
                'Let me know what you\'re trying to find or do',
                'I\'ll provide step-by-step navigation guidance',
                'If needed, I can connect you with technical support'
            ]
        };
    }
}

class BasicFederalGuidanceAgent {
    async provideGuidance(query, analysis) {
        return {
            agent: 'FEDERAL_GUIDANCE',
            content: `I'll help you navigate federal opportunities in GovWin IQ:\n\n1. Go to "Opportunities" in the main menu\n2. Click "Advanced Search"\n3. Set Market filter to "Federal"\n4. Add your industry and agency filters\n5. Execute your search\n\nWould you like more detailed guidance on any of these steps?`,
            guidanceType: 'federal_navigation',
            nextSteps: [
                'Set up your federal search filters',
                'Execute the search in GovWin IQ',
                'Review and organize your results'
            ]
        };
    }
}

class BasicSLEDGuidanceAgent {
    async provideGuidance(query, analysis) {
        return {
            agent: 'SLED_GUIDANCE',
            content: `I'll guide you through SLED opportunities in GovWin IQ:\n\n1. Navigate to "Opportunities" → "Advanced Search"\n2. Set Market to "SLED"\n3. Select State, Local, or Education segments\n4. Set your geographic and industry filters\n5. Execute your search\n\nSLED markets have different procurement cycles - would you like guidance on timing?`,
            guidanceType: 'sled_navigation',
            nextSteps: [
                'Configure SLED market filters',
                'Execute search with geographic focus',
                'Set up alerts for procurement cycles'
            ]
        };
    }
}

class BasicGeneralGuidanceAgent {
    async provideGuidance(query, analysis) {
        return {
            agent: 'GENERAL_GUIDANCE',
            content: `I'm here to help you navigate GovWin IQ effectively! I can guide you through:\n\n• Finding opportunities (federal and state/local)\n• Setting up searches and alerts\n• Understanding platform features\n• Technical navigation help\n\nWhat would you like to start with?`,
            guidanceType: 'general_guidance',
            nextSteps: [
                'Choose your area of focus',
                'I\'ll provide specific step-by-step guidance',
                'We can set up ongoing monitoring'
            ]
        };
    }
}

module.exports = {
    BasicCSMCoordinator,
    ConversationManager,
    ResponseCache
};
