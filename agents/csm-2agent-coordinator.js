/**
 * CSM 2-Agent Coordinator
 * 
 * Simplified coordination system for 2-agent Customer Success architecture:
 * 1) Search & Navigation Agent - Guides users through GovWin's search tools
 * 2) Customer Success Agent - Platform navigation, troubleshooting, escalation
 * 
 * Focus: Teaching users HOW to use GovWin's built-in features, not replicating them
 */

const SearchNavigationAgent = require('./search-navigation-agent');
const CustomerSuccessAgent = require('./customer-success-agent');

class CSM2AgentCoordinator {
    constructor(logger) {
        this.logger = logger;
        this.coordinatorId = 'csm-2agent-coordinator';
        
        // Initialize the two specialized agents
        this.searchNavigationAgent = new SearchNavigationAgent(logger);
        this.customerSuccessAgent = new CustomerSuccessAgent(logger);
        
        this.agents = {
            'search-navigation': this.searchNavigationAgent,
            'customer-success': this.customerSuccessAgent
        };
    }

    async processQuery(query, userId, sessionContext = {}) {
        try {
            // Analyze query to determine appropriate agent
            const routing = await this.analyzeAndRoute(query, sessionContext);
            
            // Execute with the selected agent
            const result = await this.executeWithAgent(routing.primaryAgent, query, routing, sessionContext);
            
            // Format response for CSM interface
            return this.formatCSMResponse(result, routing, query, userId);

        } catch (error) {
            this.logger.error('CSM 2-Agent Coordinator error', { 
                error: error.message, 
                query,
                userId 
            });
            
            return this.createFallbackResponse(query, userId, error);
        }
    }

    async analyzeAndRoute(query, sessionContext = {}) {
        const queryLower = query.toLowerCase();
        
        // Determine primary agent based on query intent
        let primaryAgent = 'customer-success'; // Default to customer success
        let confidence = 0.6;
        let routingReason = 'default_customer_success';

        // Search & Navigation Agent routing
        if (this.isSearchNavigationQuery(queryLower)) {
            primaryAgent = 'search-navigation';
            confidence = 0.8;
            routingReason = 'search_navigation_intent';
        }
        // Customer Success Agent routing  
        else if (this.isCustomerSuccessQuery(queryLower)) {
            primaryAgent = 'customer-success';
            confidence = 0.9;
            routingReason = 'customer_success_intent';
        }

        return {
            primaryAgent,
            confidence,
            routingReason,
            requiresEscalation: this.requiresEscalation(queryLower),
            urgency: this.determineUrgency(queryLower),
            sessionContext
        };
    }

    isSearchNavigationQuery(queryLower) {
        const searchKeywords = [
            'how to search', 'how do i search', 'find opportunities', 'search for',
            'filter', 'filters', 'search results', 'advanced search',
            'federal opportunities', 'sled opportunities', 'state opportunities',
            'local opportunities', 'search tips', 'search strategy',
            'save search', 'saved searches', 'alert', 'alerts', 'monitor',
            'notification', 'where to find', 'where do i find', 
            'navigate to', 'how to navigate', 'search tools'
        ];
        
        return searchKeywords.some(keyword => queryLower.includes(keyword));
    }

    isCustomerSuccessQuery(queryLower) {
        const supportKeywords = [
            'error', 'problem', 'issue', 'broken', 'not working',
            'login', 'password', 'access', 'locked out', 
            'report', 'reports', 'dashboard', 'analytics',
            'pipeline', 'track', 'tracking', 'workflow', 'manage',
            'team', 'share', 'collaborate', 'permission', 'user',
            'account', 'subscription', 'billing', 'license',
            'integration', 'api', 'connect', 'sync', 'export',
            'help', 'support', 'trouble', 'manager', 'escalate'
        ];
        
        return supportKeywords.some(keyword => queryLower.includes(keyword));
    }

    requiresEscalation(queryLower) {
        const escalationTriggers = [
            'manager', 'supervisor', 'escalate', 'complain', 'complaint',
            'urgent', 'critical', 'emergency', 'broken', 'down',
            'not working', 'cant access', 'locked out', 'billing issue'
        ];
        
        return escalationTriggers.some(trigger => queryLower.includes(trigger));
    }

    determineUrgency(queryLower) {
        if (queryLower.includes('urgent') || queryLower.includes('critical') || 
            queryLower.includes('emergency') || queryLower.includes('down')) {
            return 'critical';
        }
        
        if (queryLower.includes('asap') || queryLower.includes('soon') ||
            queryLower.includes('quickly') || queryLower.includes('problem')) {
            return 'high';
        }
        
        return 'normal';
    }

    async executeWithAgent(agentId, query, routing, sessionContext) {
        const agent = this.agents[agentId];
        if (!agent) {
            throw new Error(`Unknown agent: ${agentId}`);
        }

        this.logger.info('Executing with agent', { 
            agentId, 
            routing: routing.routingReason,
            confidence: routing.confidence 
        });

        // Execute with the selected agent
        const result = await agent.processQuery(query, {
            ...sessionContext,
            routing,
            urgency: routing.urgency
        });

        // Add coordination metadata
        result.coordination = {
            selectedAgent: agentId,
            routingReason: routing.routingReason,
            routingConfidence: routing.confidence,
            timestamp: new Date().toISOString()
        };

        return result;
    }

    formatCSMResponse(agentResult, routing, query, userId) {
        // Create standardized CSM response format
        const response = {
            success: true,
            queryId: this.generateQueryId(),
            userId,
            query,
            timestamp: new Date().toISOString(),
            
            // Agent response data
            agentUsed: agentResult.agentId,
            message: agentResult.content,
            guidanceType: agentResult.guidanceType,
            nextSteps: agentResult.nextSteps || [],
            
            // Customer Success specific fields
            escalationSuggested: agentResult.escalationSuggested || false,
            urgency: agentResult.urgency || routing.urgency || 'normal',
            confidence: agentResult.confidence || routing.confidence,
            
            // Navigation guidance (if applicable)
            navigationPath: agentResult.navigationPath || [],
            
            // Coordination metadata
            routing: {
                primaryAgent: routing.primaryAgent,
                routingReason: routing.routingReason,
                routingConfidence: routing.confidence
            },
            
            // Available capabilities
            availableAgents: ['search-navigation', 'customer-success'],
            agentCapabilities: this.getAgentCapabilities(),
            
            // CSM guidance format
            csmGuidance: [{
                agent: this.mapAgentToCSMType(agentResult.agentId),
                content: agentResult.content,
                guidanceType: agentResult.guidanceType || 'general_guidance',
                nextSteps: agentResult.nextSteps || [],
                confidence: agentResult.confidence || routing.confidence,
                role: 'primary'
            }]
        };

        // Add escalation details if suggested
        if (agentResult.escalationSuggested) {
            response.escalation = {
                suggested: true,
                urgency: agentResult.urgency || 'high',
                reason: 'Agent recommended escalation',
                nextSteps: [
                    'Customer Success Manager will contact you',
                    'Prepare account details and issue description',
                    'Expect follow-up within 1 business hour'
                ]
            };
        }

        return response;
    }

    mapAgentToCSMType(agentId) {
        const mapping = {
            'search-navigation': 'SEARCH_NAVIGATION_GUIDE',
            'customer-success': 'CUSTOMER_SUCCESS_SUPPORT'
        };
        
        return mapping[agentId] || 'GENERAL_SUPPORT';
    }

    getAgentCapabilities() {
        return {
            'search-navigation': this.searchNavigationAgent.capabilities,
            'customer-success': this.customerSuccessAgent.capabilities
        };
    }

    generateQueryId() {
        return `csm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    createFallbackResponse(query, userId, error) {
        return {
            success: false,
            queryId: this.generateQueryId(),
            userId,
            query,
            timestamp: new Date().toISOString(),
            
            agentUsed: 'fallback',
            message: `I apologize for the technical issue. Let me connect you directly with a Customer Success Manager who can provide immediate assistance.

Your question: "${query}"

A Customer Success Manager will contact you within the next hour to ensure you get the help you need.

For urgent issues, you can also call our priority support line directly.`,
            
            guidanceType: 'technical_fallback',
            nextSteps: [
                'Customer Success Manager will contact you within 1 hour',
                'Have your account details ready',
                'Consider phone support for urgent needs'
            ],
            
            escalationSuggested: true,
            urgency: 'high',
            confidence: 1.0,
            
            error: {
                occurred: true,
                message: error.message,
                fallbackActivated: true
            },
            
            csmGuidance: [{
                agent: 'TECHNICAL_FALLBACK',
                content: 'Technical issue encountered - escalating to human support',
                guidanceType: 'error_escalation',
                nextSteps: [
                    'Immediate human support escalation',
                    'Customer Success Manager contact within 1 hour',
                    'Priority support available for urgent needs'
                ],
                confidence: 1.0,
                role: 'primary'
            }]
        };
    }

    // Utility method to get agent statistics
    getCoordinatorStats() {
        return {
            coordinatorId: this.coordinatorId,
            totalAgents: Object.keys(this.agents).length,
            availableAgents: Object.keys(this.agents),
            agentCapabilities: this.getAgentCapabilities(),
            routingStrategy: 'intent-based-2agent',
            lastUpdated: new Date().toISOString()
        };
    }

    // Method to validate agent health
    async validateAgents() {
        const results = {};
        
        for (const [agentId, agent] of Object.entries(this.agents)) {
            try {
                // Test with a simple query
                const testResult = await agent.processQuery('test query', { test: true });
                results[agentId] = {
                    healthy: true,
                    capabilities: agent.capabilities || [],
                    lastTest: new Date().toISOString()
                };
            } catch (error) {
                results[agentId] = {
                    healthy: false,
                    error: error.message,
                    lastTest: new Date().toISOString()
                };
            }
        }
        
        return results;
    }
}

module.exports = CSM2AgentCoordinator;