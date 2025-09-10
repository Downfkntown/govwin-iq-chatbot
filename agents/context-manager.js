/**
 * GovWin IQ Context Manager
 * 
 * Manages conversation state and user context across agent switches:
 * - Session management and persistence
 * - Conversation history tracking
 * - User preferences and profile data
 * - Context continuity during agent handoffs
 * - Multi-turn conversation state
 * - Domain-specific context preservation
 */

const { agentRegistry } = require('./agent-registry');

// Context types
const ContextTypes = {
    USER_PROFILE: 'user_profile',
    CONVERSATION: 'conversation',
    SESSION: 'session',
    DOMAIN: 'domain',
    AGENT_SPECIFIC: 'agent_specific',
    WORKFLOW: 'workflow',
    PREFERENCES: 'preferences'
};

// Context priorities for conflict resolution
const ContextPriorities = {
    SESSION: 1,      // Highest priority - current session data
    CONVERSATION: 2, // Conversation-specific context
    USER_PROFILE: 3, // User profile and preferences
    DOMAIN: 4,       // Domain-specific context
    AGENT_SPECIFIC: 5, // Agent-specific context
    GLOBAL: 6        // Lowest priority - global defaults
};

// Context scopes
const ContextScopes = {
    GLOBAL: 'global',     // Available to all agents
    SESSION: 'session',   // Available within current session
    AGENT: 'agent',       // Specific to current agent
    DOMAIN: 'domain',     // Specific to domain (federal, SLED, etc.)
    TEMPORARY: 'temporary' // Short-lived context
};

class ContextManager {
    constructor() {
        this.sessions = new Map();           // Active session contexts
        this.userProfiles = new Map();      // Persistent user profiles
        this.conversationHistory = new Map(); // Conversation histories
        this.domainContexts = new Map();    // Domain-specific contexts
        this.agentContexts = new Map();     // Agent-specific contexts
        this.contextHooks = new Map();      // Context change hooks
        
        this.maxSessionDuration = 24 * 60 * 60 * 1000; // 24 hours
        this.maxConversationHistory = 100;  // Maximum conversation turns
        this.maxContextSize = 10000;        // Maximum context data size
        this.cleanupInterval = 60 * 60 * 1000; // 1 hour cleanup interval
        
        this.initializeGlobalContext();
        this.startCleanupProcess();
    }

    /**
     * Initialize global context and default settings
     */
    initializeGlobalContext() {
        this.globalContext = {
            system: {
                name: 'GovWin IQ Assistant',
                version: '1.0.0',
                capabilities: Object.keys(agentRegistry),
                startTime: new Date()
            },
            defaults: {
                language: 'en',
                timezone: 'UTC',
                dateFormat: 'MM/DD/YYYY',
                currency: 'USD',
                responseFormat: 'conversational'
            },
            domains: {
                federal: { initialized: false, lastAccess: null },
                sled: { initialized: false, lastAccess: null },
                contracts: { initialized: false, lastAccess: null },
                opportunities: { initialized: false, lastAccess: null }
            }
        };
    }

    /**
     * Create or retrieve session context
     */
    createSession(sessionId, userId = null, initialContext = {}) {
        if (this.sessions.has(sessionId)) {
            return this.getSession(sessionId);
        }

        const session = {
            id: sessionId,
            userId,
            createdAt: new Date(),
            lastAccessAt: new Date(),
            expiresAt: new Date(Date.now() + this.maxSessionDuration),
            
            // Session state
            currentAgent: null,
            previousAgent: null,
            agentSwitchCount: 0,
            conversationTurns: 0,
            
            // Context data
            context: {
                session: { ...initialContext },
                conversation: {
                    history: [],
                    currentTopic: null,
                    lastQuery: null,
                    lastResponse: null,
                    intent: null,
                    confidence: 0
                },
                user: userId ? this.getUserProfile(userId) : this.createTemporaryProfile(),
                domain: {},
                workflow: {},
                temporary: {}
            },
            
            // Metadata
            metadata: {
                userAgent: initialContext.userAgent,
                platform: initialContext.platform,
                channel: initialContext.channel || 'web',
                features: new Set(),
                flags: new Map(),
                metrics: {
                    totalQueries: 0,
                    agentSwitches: 0,
                    averageResponseTime: 0,
                    satisfactionScore: null
                }
            }
        };

        this.sessions.set(sessionId, session);
        
        // Initialize conversation history
        if (!this.conversationHistory.has(sessionId)) {
            this.conversationHistory.set(sessionId, []);
        }

        this.emitContextChange('session_created', { sessionId, userId });
        return session;
    }

    /**
     * Get session context
     */
    getSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return null;
        }

        // Check if session is expired
        if (new Date() > session.expiresAt) {
            this.destroySession(sessionId);
            return null;
        }

        // Update last access time
        session.lastAccessAt = new Date();
        return session;
    }

    /**
     * Update session context
     */
    updateSession(sessionId, updates, scope = ContextScopes.SESSION) {
        const session = this.getSession(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }

        // Apply updates based on scope
        switch (scope) {
            case ContextScopes.SESSION:
                Object.assign(session.context.session, updates);
                break;
            case ContextScopes.CONVERSATION:
                Object.assign(session.context.conversation, updates);
                break;
            case ContextScopes.DOMAIN:
                Object.assign(session.context.domain, updates);
                break;
            case ContextScopes.TEMPORARY:
                Object.assign(session.context.temporary, updates);
                break;
            default:
                Object.assign(session.context.session, updates);
        }

        this.emitContextChange('session_updated', { sessionId, updates, scope });
        return session;
    }

    /**
     * Add conversation turn to history
     */
    addConversationTurn(sessionId, turn) {
        const session = this.getSession(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }

        const conversationTurn = {
            id: `turn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            sequence: session.conversationTurns + 1,
            ...turn
        };

        // Add to session conversation history
        session.context.conversation.history.push(conversationTurn);
        session.conversationTurns++;

        // Add to global conversation history
        const globalHistory = this.conversationHistory.get(sessionId) || [];
        globalHistory.push(conversationTurn);
        
        // Limit history size
        if (globalHistory.length > this.maxConversationHistory) {
            globalHistory.shift();
        }
        
        this.conversationHistory.set(sessionId, globalHistory);

        // Update conversation context
        session.context.conversation.lastQuery = turn.userQuery;
        session.context.conversation.lastResponse = turn.agentResponse;
        session.context.conversation.currentTopic = turn.topic || session.context.conversation.currentTopic;

        this.emitContextChange('conversation_turn_added', { sessionId, turn: conversationTurn });
        return conversationTurn;
    }

    /**
     * Handle agent switch with context preservation
     */
    switchAgent(sessionId, fromAgent, toAgent, reason = 'routing', preserveContext = true) {
        const session = this.getSession(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }

        // Store current agent context if preserving
        if (preserveContext && fromAgent) {
            this.preserveAgentContext(sessionId, fromAgent, session.context);
        }

        // Update session state
        session.previousAgent = session.currentAgent;
        session.currentAgent = toAgent;
        session.agentSwitchCount++;
        session.metadata.metrics.agentSwitches++;

        // Load agent-specific context
        const agentContext = this.loadAgentContext(sessionId, toAgent);
        session.context.agent_specific = agentContext;

        // Create handoff record
        const handoff = {
            id: `handoff_${Date.now()}`,
            timestamp: new Date(),
            fromAgent,
            toAgent,
            reason,
            contextPreserved: preserveContext,
            sessionState: {
                conversationTurns: session.conversationTurns,
                currentTopic: session.context.conversation.currentTopic
            }
        };

        // Add to conversation history
        this.addConversationTurn(sessionId, {
            type: 'agent_switch',
            fromAgent,
            toAgent,
            reason,
            handoff
        });

        this.emitContextChange('agent_switched', { sessionId, handoff });
        return handoff;
    }

    /**
     * Preserve agent-specific context during switches
     */
    preserveAgentContext(sessionId, agentId, context) {
        const agentKey = `${sessionId}:${agentId}`;
        
        if (!this.agentContexts.has(agentKey)) {
            this.agentContexts.set(agentKey, {
                agentId,
                sessionId,
                createdAt: new Date(),
                contexts: []
            });
        }

        const agentContext = this.agentContexts.get(agentKey);
        agentContext.contexts.push({
            timestamp: new Date(),
            context: this.deepClone(context),
            preserved: true
        });

        // Limit context history
        if (agentContext.contexts.length > 10) {
            agentContext.contexts.shift();
        }

        agentContext.lastUpdated = new Date();
    }

    /**
     * Load agent-specific context
     */
    loadAgentContext(sessionId, agentId) {
        const agentKey = `${sessionId}:${agentId}`;
        const agentContext = this.agentContexts.get(agentKey);
        
        if (!agentContext || agentContext.contexts.length === 0) {
            return this.createDefaultAgentContext(agentId);
        }

        // Return most recent context
        const latestContext = agentContext.contexts[agentContext.contexts.length - 1];
        return latestContext.context;
    }

    /**
     * Create default agent context
     */
    createDefaultAgentContext(agentId) {
        const agent = agentRegistry[agentId];
        
        return {
            agentId,
            preferences: {},
            state: 'initialized',
            capabilities: agent?.capabilities || [],
            expertise: agent?.expertise || [],
            history: [],
            metrics: {
                interactions: 0,
                successRate: 0,
                averageConfidence: 0
            }
        };
    }

    /**
     * Get comprehensive context for an agent
     */
    getContextForAgent(sessionId, agentId, includeHistory = true) {
        const session = this.getSession(sessionId);
        if (!session) {
            return null;
        }

        const context = {
            // Core context data
            session: session.context.session,
            conversation: includeHistory ? session.context.conversation : {
                currentTopic: session.context.conversation.currentTopic,
                intent: session.context.conversation.intent,
                confidence: session.context.conversation.confidence
            },
            user: session.context.user,
            domain: session.context.domain,
            
            // Agent-specific context
            agent: this.loadAgentContext(sessionId, agentId),
            
            // Global context
            global: this.globalContext,
            
            // Metadata
            metadata: {
                sessionId,
                userId: session.userId,
                currentAgent: agentId,
                previousAgent: session.previousAgent,
                conversationTurns: session.conversationTurns,
                agentSwitchCount: session.agentSwitchCount,
                lastAccessAt: session.lastAccessAt
            }
        };

        // Add domain-specific context if relevant
        const agent = agentRegistry[agentId];
        if (agent && agent.scope) {
            const domainContext = this.domainContexts.get(agent.scope);
            if (domainContext) {
                context.domain[agent.scope] = domainContext;
            }
        }

        return context;
    }

    /**
     * Set domain-specific context
     */
    setDomainContext(domain, contextData) {
        const existingContext = this.domainContexts.get(domain) || {};
        const updatedContext = {
            ...existingContext,
            ...contextData,
            lastUpdated: new Date()
        };
        
        this.domainContexts.set(domain, updatedContext);
        this.globalContext.domains[domain].lastAccess = new Date();
        
        this.emitContextChange('domain_context_updated', { domain, context: updatedContext });
    }

    /**
     * Get domain-specific context
     */
    getDomainContext(domain) {
        return this.domainContexts.get(domain) || {};
    }

    /**
     * Create or get user profile
     */
    createUserProfile(userId, profileData = {}) {
        if (this.userProfiles.has(userId)) {
            return this.updateUserProfile(userId, profileData);
        }

        const profile = {
            id: userId,
            createdAt: new Date(),
            lastAccessAt: new Date(),
            
            // Basic profile
            preferences: {
                language: 'en',
                timezone: 'UTC',
                responseFormat: 'conversational',
                domains: [],
                notifications: true,
                ...profileData.preferences
            },
            
            // Usage patterns
            usage: {
                totalSessions: 0,
                totalQueries: 0,
                favoriteAgents: [],
                commonTopics: [],
                averageSessionDuration: 0,
                lastSessionAt: null
            },
            
            // Domain expertise/interests
            domains: {
                federal: { experience: 'unknown', interests: [] },
                sled: { experience: 'unknown', interests: [] },
                contracts: { experience: 'unknown', interests: [] }
            },
            
            // Custom data
            custom: profileData.custom || {}
        };

        this.userProfiles.set(userId, profile);
        this.emitContextChange('user_profile_created', { userId, profile });
        return profile;
    }

    /**
     * Get user profile
     */
    getUserProfile(userId) {
        const profile = this.userProfiles.get(userId);
        if (profile) {
            profile.lastAccessAt = new Date();
        }
        return profile || this.createTemporaryProfile();
    }

    /**
     * Update user profile
     */
    updateUserProfile(userId, updates) {
        const profile = this.getUserProfile(userId);
        if (profile.id !== userId) {
            // Create new profile if temporary
            return this.createUserProfile(userId, updates);
        }

        // Deep merge updates
        this.deepMerge(profile, updates);
        profile.lastUpdated = new Date();
        
        this.emitContextChange('user_profile_updated', { userId, updates });
        return profile;
    }

    /**
     * Create temporary profile for anonymous users
     */
    createTemporaryProfile() {
        return {
            id: `temp_${Date.now()}`,
            temporary: true,
            createdAt: new Date(),
            preferences: { ...this.globalContext.defaults },
            usage: {
                totalSessions: 0,
                totalQueries: 0,
                sessionStartedAt: new Date()
            },
            domains: {},
            custom: {}
        };
    }

    /**
     * Get conversation summary
     */
    getConversationSummary(sessionId, lastN = 10) {
        const history = this.conversationHistory.get(sessionId) || [];
        const recentHistory = history.slice(-lastN);
        
        return {
            sessionId,
            totalTurns: history.length,
            recentTurns: recentHistory.length,
            turns: recentHistory,
            topics: this.extractTopics(recentHistory),
            agents: this.extractAgentUsage(recentHistory),
            lastActivity: history.length > 0 ? history[history.length - 1].timestamp : null
        };
    }

    /**
     * Extract topics from conversation history
     */
    extractTopics(history) {
        const topics = new Map();
        
        history.forEach(turn => {
            if (turn.topic) {
                topics.set(turn.topic, (topics.get(turn.topic) || 0) + 1);
            }
        });
        
        return Array.from(topics.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([topic, count]) => ({ topic, count }));
    }

    /**
     * Extract agent usage from conversation history
     */
    extractAgentUsage(history) {
        const agents = new Map();
        
        history.forEach(turn => {
            if (turn.agentId) {
                agents.set(turn.agentId, (agents.get(turn.agentId) || 0) + 1);
            }
        });
        
        return Array.from(agents.entries())
            .sort(([,a], [,b]) => b - a)
            .map(([agentId, count]) => ({ agentId, count }));
    }

    /**
     * Context change event system
     */
    onContextChange(eventType, handler) {
        if (!this.contextHooks.has(eventType)) {
            this.contextHooks.set(eventType, []);
        }
        this.contextHooks.get(eventType).push(handler);
    }

    emitContextChange(eventType, data) {
        const handlers = this.contextHooks.get(eventType) || [];
        const wildcardHandlers = this.contextHooks.get('*') || [];
        
        [...handlers, ...wildcardHandlers].forEach(handler => {
            try {
                handler({ type: eventType, data, timestamp: new Date() });
            } catch (error) {
                console.error('Context change handler error:', error);
            }
        });
    }

    /**
     * Cleanup expired sessions and data
     */
    startCleanupProcess() {
        setInterval(() => {
            this.cleanupExpiredSessions();
            this.cleanupOldContexts();
        }, this.cleanupInterval);
    }

    cleanupExpiredSessions() {
        const now = new Date();
        const expiredSessions = [];
        
        for (const [sessionId, session] of this.sessions) {
            if (now > session.expiresAt) {
                expiredSessions.push(sessionId);
            }
        }
        
        expiredSessions.forEach(sessionId => {
            this.destroySession(sessionId);
        });
    }

    cleanupOldContexts() {
        const cutoffTime = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)); // 7 days
        
        // Cleanup agent contexts
        for (const [key, context] of this.agentContexts) {
            if (context.lastUpdated && context.lastUpdated < cutoffTime) {
                this.agentContexts.delete(key);
            }
        }
    }

    /**
     * Destroy session and cleanup data
     */
    destroySession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            // Update user profile with session data
            if (session.userId && !session.context.user.temporary) {
                this.updateUserProfileFromSession(session.userId, session);
            }
            
            // Archive conversation history (optional)
            this.archiveConversationHistory(sessionId);
            
            // Cleanup
            this.sessions.delete(sessionId);
            this.conversationHistory.delete(sessionId);
            
            this.emitContextChange('session_destroyed', { sessionId });
        }
    }

    /**
     * Update user profile from session data
     */
    updateUserProfileFromSession(userId, session) {
        const profile = this.getUserProfile(userId);
        
        profile.usage.totalSessions++;
        profile.usage.lastSessionAt = session.createdAt;
        profile.usage.totalQueries += session.conversationTurns;
        
        // Calculate session duration
        const duration = session.lastAccessAt - session.createdAt;
        profile.usage.averageSessionDuration = 
            (profile.usage.averageSessionDuration + duration) / 2;
        
        this.userProfiles.set(userId, profile);
    }

    /**
     * Archive conversation history
     */
    archiveConversationHistory(sessionId) {
        const history = this.conversationHistory.get(sessionId);
        if (history && history.length > 0) {
            // In a real implementation, this would save to persistent storage
            console.log(`Archiving conversation history for session ${sessionId}: ${history.length} turns`);
        }
    }

    /**
     * Utility methods
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    deepMerge(target, source) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key]) target[key] = {};
                this.deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }

    /**
     * Get context manager statistics
     */
    getStats() {
        return {
            activeSessions: this.sessions.size,
            userProfiles: this.userProfiles.size,
            totalConversations: this.conversationHistory.size,
            domainContexts: this.domainContexts.size,
            agentContexts: this.agentContexts.size,
            averageSessionDuration: this.calculateAverageSessionDuration(),
            topDomains: this.getTopDomains(),
            memoryUsage: this.estimateMemoryUsage()
        };
    }

    calculateAverageSessionDuration() {
        const sessions = Array.from(this.sessions.values());
        if (sessions.length === 0) return 0;
        
        const durations = sessions.map(session => 
            session.lastAccessAt - session.createdAt
        );
        
        const sum = durations.reduce((acc, duration) => acc + duration, 0);
        return sum / durations.length;
    }

    getTopDomains() {
        const domainCounts = {};
        
        for (const [domain, context] of this.domainContexts) {
            domainCounts[domain] = context.accessCount || 0;
        }
        
        return Object.entries(domainCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([domain, count]) => ({ domain, count }));
    }

    estimateMemoryUsage() {
        // Rough estimation of memory usage
        const sessionsSize = JSON.stringify(Array.from(this.sessions.values())).length;
        const profilesSize = JSON.stringify(Array.from(this.userProfiles.values())).length;
        const historySize = JSON.stringify(Array.from(this.conversationHistory.values())).length;
        
        return {
            sessions: Math.round(sessionsSize / 1024) + ' KB',
            profiles: Math.round(profilesSize / 1024) + ' KB',
            history: Math.round(historySize / 1024) + ' KB',
            total: Math.round((sessionsSize + profilesSize + historySize) / 1024) + ' KB'
        };
    }
}

// Export singleton instance
const contextManager = new ContextManager();

module.exports = {
    ContextManager,
    contextManager,
    ContextTypes,
    ContextPriorities,
    ContextScopes
};