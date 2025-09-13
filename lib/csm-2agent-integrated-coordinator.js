/**
 * CSM 2-Agent Integrated Coordinator
 * 
 * Streamlined Customer Success Management system with 2 specialized agents:
 * 1) Search & Navigation Agent - Guides users through GovWin's search tools
 * 2) Customer Success Agent - Platform navigation, troubleshooting, escalation
 * 
 * Philosophy: Teach users HOW to use GovWin's built-in features, don't replicate them
 */

const CSM2AgentCoordinator = require('../agents/csm-2agent-coordinator');

class CSM2AgentIntegratedCoordinator {
    constructor(redisClient, logger, config) {
        this.redisClient = redisClient;
        this.logger = logger;
        this.config = config || {};
        
        // Initialize the 2-agent coordinator
        this.coordinator = new CSM2AgentCoordinator(logger);
        
        // Session management
        this.sessions = new Map();
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        
        // Initialize caching if Redis is available
        this.cacheEnabled = !!redisClient;
        this.cacheTTL = 15 * 60; // 15 minutes
        
        this.logger.info('CSM 2-Agent Integrated Coordinator initialized', {
            cacheEnabled: this.cacheEnabled,
            sessionTimeout: this.sessionTimeout,
            availableAgents: ['search-navigation', 'customer-success']
        });
    }

    async processQuery(query, userId, metadata = {}) {
        const startTime = Date.now();
        const queryId = this.generateQueryId();
        
        try {
            this.logger.info('Processing CSM query', { 
                queryId, 
                userId, 
                query: query.substring(0, 100) + (query.length > 100 ? '...' : '')
            });

            // Get or create session context
            const sessionContext = await this.getSessionContext(userId);
            
            // Check cache for similar recent queries
            let cachedResponse = null;
            if (this.cacheEnabled) {
                cachedResponse = await this.checkQueryCache(query, userId);
            }
            
            let result;
            if (cachedResponse) {
                this.logger.info('Using cached response', { queryId, userId });
                result = cachedResponse;
                result.fromCache = true;
            } else {
                // Process with 2-agent coordinator
                result = await this.coordinator.processQuery(query, userId, sessionContext);
                result.fromCache = false;
                
                // Cache the response if enabled
                if (this.cacheEnabled && result.success) {
                    await this.cacheQueryResponse(query, userId, result);
                }
            }

            // Update session context
            await this.updateSessionContext(userId, query, result);
            
            // Add processing metadata
            result.processing = {
                queryId,
                processingTime: Date.now() - startTime,
                coordinator: 'csm-2agent-integrated',
                version: '2.0',
                timestamp: new Date().toISOString()
            };

            this.logger.info('CSM query processed successfully', {
                queryId,
                userId,
                agentUsed: result.agentUsed,
                processingTime: result.processing.processingTime,
                fromCache: result.fromCache,
                escalationSuggested: result.escalationSuggested
            });

            return result;

        } catch (error) {
            this.logger.error('CSM query processing failed', {
                queryId,
                userId,
                query,
                error: error.message,
                stack: error.stack
            });

            return this.createErrorResponse(queryId, userId, query, error, startTime);
        }
    }

    async getSessionContext(userId) {
        // Check in-memory session first
        if (this.sessions.has(userId)) {
            const session = this.sessions.get(userId);
            if (Date.now() - session.lastAccess < this.sessionTimeout) {
                session.lastAccess = Date.now();
                return session.context;
            } else {
                this.sessions.delete(userId);
            }
        }

        // Try Redis cache if available
        if (this.cacheEnabled) {
            try {
                const cachedSession = await this.redisClient.get(`session:${userId}`);
                if (cachedSession) {
                    const session = JSON.parse(cachedSession);
                    this.sessions.set(userId, {
                        context: session,
                        lastAccess: Date.now()
                    });
                    return session;
                }
            } catch (error) {
                this.logger.warn('Failed to retrieve session from cache', {
                    userId,
                    error: error.message
                });
            }
        }

        // Create new session context
        const newContext = {
            userId,
            createdAt: new Date().toISOString(),
            queryCount: 0,
            lastQuery: null,
            lastAgent: null,
            escalationHistory: [],
            preferences: {}
        };

        this.sessions.set(userId, {
            context: newContext,
            lastAccess: Date.now()
        });

        return newContext;
    }

    async updateSessionContext(userId, query, result) {
        const session = this.sessions.get(userId);
        if (session) {
            session.context.queryCount++;
            session.context.lastQuery = query;
            session.context.lastAgent = result.agentUsed;
            session.context.lastActivity = new Date().toISOString();
            
            // Track escalation history
            if (result.escalationSuggested) {
                session.context.escalationHistory.push({
                    query,
                    timestamp: new Date().toISOString(),
                    reason: result.escalation?.reason || 'escalation_suggested'
                });
            }
            
            session.lastAccess = Date.now();

            // Update Redis cache if available
            if (this.cacheEnabled) {
                try {
                    await this.redisClient.setex(
                        `session:${userId}`,
                        this.cacheTTL,
                        JSON.stringify(session.context)
                    );
                } catch (error) {
                    this.logger.warn('Failed to update session in cache', {
                        userId,
                        error: error.message
                    });
                }
            }
        }
    }

    async checkQueryCache(query, userId) {
        if (!this.cacheEnabled) return null;

        try {
            const cacheKey = this.generateCacheKey(query);
            const cached = await this.redisClient.get(cacheKey);
            
            if (cached) {
                const response = JSON.parse(cached);
                this.logger.debug('Cache hit for query', { cacheKey, userId });
                return response;
            }
        } catch (error) {
            this.logger.warn('Cache check failed', {
                query: query.substring(0, 50),
                userId,
                error: error.message
            });
        }

        return null;
    }

    async cacheQueryResponse(query, userId, response) {
        if (!this.cacheEnabled || !response.success) return;

        try {
            const cacheKey = this.generateCacheKey(query);
            const cacheData = {
                ...response,
                cachedAt: new Date().toISOString(),
                originalUserId: userId
            };

            await this.redisClient.setex(
                cacheKey,
                this.cacheTTL,
                JSON.stringify(cacheData)
            );

            this.logger.debug('Query response cached', { cacheKey, userId });
        } catch (error) {
            this.logger.warn('Failed to cache response', {
                query: query.substring(0, 50),
                userId,
                error: error.message
            });
        }
    }

    generateCacheKey(query) {
        // Create a normalized cache key from the query
        const normalized = query.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        
        const hash = this.simpleHash(normalized);
        return `query:${hash}`;
    }

    simpleHash(str) {
        let hash = 0;
        if (str.length === 0) return hash;
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return Math.abs(hash).toString(36);
    }

    generateQueryId() {
        return `csm2-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    createErrorResponse(queryId, userId, query, error, startTime) {
        return {
            success: false,
            queryId,
            userId,
            query,
            timestamp: new Date().toISOString(),
            
            agentUsed: 'error-fallback',
            message: `I apologize for the technical issue. I'm immediately connecting you with a Customer Success Manager who can provide direct assistance.

Your question: "${query}"

**What's happening:** I encountered a technical issue while processing your request, but I want to ensure you get the help you need without any delays.

**Next steps:** 
• A Customer Success Manager will contact you within the next hour
• They'll have access to your account and can provide personalized support
• For urgent issues, you can also call our priority support line

I've created a high-priority support ticket for you.`,
            
            guidanceType: 'technical_error_escalation',
            nextSteps: [
                'Customer Success Manager will contact you within 1 hour',
                'Have your account details and original question ready',
                'Consider phone support if this is urgent',
                'Expect personalized, hands-on assistance'
            ],
            
            escalationSuggested: true,
            urgency: 'high',
            confidence: 1.0,
            fromCache: false,
            
            error: {
                occurred: true,
                message: 'Technical processing error',
                escalated: true,
                type: 'coordinator_error'
            },
            
            processing: {
                queryId,
                processingTime: Date.now() - startTime,
                coordinator: 'csm-2agent-integrated',
                version: '2.0',
                timestamp: new Date().toISOString(),
                errorEncountered: true
            },
            
            csmGuidance: [{
                agent: 'ERROR_ESCALATION',
                content: 'Technical error encountered - immediate human support escalation',
                guidanceType: 'error_escalation',
                nextSteps: [
                    'High-priority support ticket created',
                    'Customer Success Manager contact within 1 hour',
                    'Full account access for personalized support',
                    'Priority phone support available for urgent needs'
                ],
                confidence: 1.0,
                role: 'primary'
            }]
        };
    }

    // Health check method
    async healthCheck() {
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            coordinator: 'csm-2agent-integrated',
            version: '2.0'
        };

        try {
            // Check coordinator health
            const coordinatorStats = this.coordinator.getCoordinatorStats();
            health.coordinator_stats = coordinatorStats;

            // Validate agents
            const agentHealth = await this.coordinator.validateAgents();
            health.agents = agentHealth;

            // Check Redis connection if enabled
            if (this.cacheEnabled) {
                await this.redisClient.ping();
                health.cache = { status: 'connected', type: 'redis' };
            } else {
                health.cache = { status: 'disabled' };
            }

            // Session statistics
            health.sessions = {
                active: this.sessions.size,
                timeout: this.sessionTimeout
            };

            // Determine overall health
            const unhealthyAgents = Object.values(agentHealth).filter(agent => !agent.healthy);
            if (unhealthyAgents.length > 0) {
                health.status = 'degraded';
                health.issues = unhealthyAgents.map(agent => `Agent ${agent.agentId} unhealthy: ${agent.error}`);
            }

        } catch (error) {
            health.status = 'unhealthy';
            health.error = error.message;
        }

        return health;
    }

    // Cleanup method
    cleanup() {
        // Clean up expired sessions
        const now = Date.now();
        for (const [userId, session] of this.sessions.entries()) {
            if (now - session.lastAccess > this.sessionTimeout) {
                this.sessions.delete(userId);
            }
        }

        this.logger.info('Session cleanup completed', {
            activeSessions: this.sessions.size
        });
    }
}

module.exports = CSM2AgentIntegratedCoordinator;