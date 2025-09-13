/**
 * Integrated CSM Coordinator - Updated for 2-Agent Customer Success Architecture
 * 
 * This coordinator now uses a streamlined 2-agent system focused on teaching users
 * HOW to use GovWin's built-in features rather than replicating them:
 * 
 * 1) Search & Navigation Agent - Guides users through GovWin's search tools
 * 2) Customer Success Agent - Platform navigation, troubleshooting, escalation
 */

const CSM2AgentIntegratedCoordinator = require('./csm-2agent-integrated-coordinator');

class IntegratedCSMCoordinator {
    constructor(redisClient, logger, config) {
        this.logger = logger;
        this.config = config;
        
        // Use the new 2-agent Customer Success system
        this.csm2AgentCoordinator = new CSM2AgentIntegratedCoordinator(redisClient, logger, config);
        
        this.logger.info('Integrated CSM Coordinator initialized with 2-agent Customer Success architecture', {
            philosophy: 'Teaching users HOW to use GovWin features vs replicating them',
            agents: ['search-navigation', 'customer-success'],
            version: '2.0'
        });
    }

    /**
     * Main query processing method - delegates to 2-agent coordinator
     */
    async processQuery(query, userId = 'default', sessionContext = {}) {
        try {
            this.logger.info('Processing query via 2-agent Customer Success system', { 
                userId, 
                query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
                coordinator: '2-agent-integrated'
            });

            // Delegate to the specialized 2-agent coordinator
            const result = await this.csm2AgentCoordinator.processQuery(query, userId, sessionContext);

            // Add legacy compatibility fields if needed
            result.analysis = {
                targetAgent: result.agentUsed,
                intent: { type: result.guidanceType },
                confidence: result.confidence
            };

            return result;

        } catch (error) {
            this.logger.error('Integrated CSM Coordinator error', {
                userId,
                query,
                error: error.message,
                stack: error.stack
            });

            // Create fallback response with escalation
            return {
                success: false,
                queryId: `fallback-${Date.now()}`,
                userId,
                query,
                timestamp: new Date().toISOString(),
                
                agentUsed: 'fallback-escalation',
                message: `I apologize for the technical issue. I'm immediately escalating you to a Customer Success Manager who can provide direct assistance.

Your question: "${query}"

**What's happening:** I encountered a technical issue while processing your request, but I want to ensure you get the help you need without any delays.

**Immediate action:** A Customer Success Manager will contact you within the next hour with personalized support.

For urgent issues, you can also call our priority support line directly.`,
                
                guidanceType: 'technical_error_escalation',
                escalationSuggested: true,
                urgency: 'high',
                confidence: 1.0,
                fromCache: false,
                
                csmGuidance: [{
                    agent: 'ESCALATION_FALLBACK',
                    content: 'Technical error - immediate escalation to Customer Success Manager',
                    guidanceType: 'error_escalation',
                    nextSteps: [
                        'Customer Success Manager will contact within 1 hour',
                        'Prepare account details and original question',
                        'Priority phone support available if urgent'
                    ],
                    confidence: 1.0,
                    role: 'primary'
                }],
                
                error: {
                    occurred: true,
                    message: error.message,
                    escalated: true
                }
            };
        }
    }

    /**
     * Health check method
     */
    async healthCheck() {
        try {
            return await this.csm2AgentCoordinator.healthCheck();
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString(),
                coordinator: 'integrated-csm-coordinator'
            };
        }
    }

    /**
     * Get coordinator statistics
     */
    getStats() {
        return {
            coordinator: 'integrated-csm-coordinator',
            version: '2.0',
            architecture: '2-agent-customer-success',
            agents: ['search-navigation', 'customer-success'],
            philosophy: 'Teaching users HOW to use GovWin features vs replicating them',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Cleanup method for session management
     */
    cleanup() {
        if (this.csm2AgentCoordinator && typeof this.csm2AgentCoordinator.cleanup === 'function') {
            this.csm2AgentCoordinator.cleanup();
        }
    }

    /**
     * Legacy compatibility method for existing integrations
     */
    async performEnhancedNLU(query, conversationState, conversationHistory) {
        // This method provides backward compatibility for any existing code
        // that might still call the old NLU method
        return {
            intent: { type: 'customer_success_guidance' },
            confidence: 0.8,
            analysis: {
                targetAgent: 'customer-success',
                domains: [{ type: 'GENERAL', confidence: 0.8 }]
            }
        };
    }
}

module.exports = IntegratedCSMCoordinator;