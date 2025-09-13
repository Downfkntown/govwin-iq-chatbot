/**
 * Fixed bridge for your existing agent architecture
 */

class ExistingAgentBridge {
    constructor(logger) {
        this.logger = logger;
        this.agentOrchestrator = null;
        this.intentRouter = null;
        this.contextManager = null;
        
        this.initializeExistingSystem();
    }

    /**
     * Initialize your existing agent system with correct imports
     */
    initializeExistingSystem() {
        try {
            // Import with correct destructuring based on your exports
            const { AgentOrchestrator, agentOrchestrator } = require('../agents/agent-orchestrator');
            const { intentRouter } = require('../agents/intent-router');
            
            // Use the singleton instance or create new one
            this.agentOrchestrator = agentOrchestrator || new AgentOrchestrator();
            this.intentRouter = intentRouter;
            
            // Try to import context manager
            try {
                const ContextManager = require('../agents/context-manager');
                this.contextManager = new ContextManager();
            } catch (error) {
                this.logger.debug('Context manager not available', { error: error.message });
            }
            
            this.logger.info('Existing agent system initialized successfully');
            
        } catch (error) {
            this.logger.error('Failed to initialize existing agent system', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    /**
     * Process query through existing agent system
     */
    async processWithExistingAgents(query, analysis, sessionContext = {}) {
        try {
            // Prepare context for your existing system
            const existingContext = {
                user: {
                    query: query,
                    intent: analysis.analysis.intent.type,
                    entities: analysis.analysis.entities,
                    domains: analysis.analysis.domains,
                    sessionContext: sessionContext
                },
                conversationHistory: analysis.conversationHistory || []
            };

            // Check if intentRouter has the route method
            let routingDecision;
            if (this.intentRouter && typeof this.intentRouter.route === 'function') {
                routingDecision = await this.intentRouter.route(query, existingContext);
            } else {
                // Create basic routing decision
                routingDecision = {
                    primaryAgent: analysis.analysis.targetAgent || this.determineAgentFromQuery(query),
                    executionPattern: 'sequential',
                    confidence: analysis.analysis.confidence
                };
            }

            // Execute through your existing orchestrator
            let orchestrationResult;
            if (this.agentOrchestrator && typeof this.agentOrchestrator.execute === 'function') {
                orchestrationResult = await this.agentOrchestrator.execute({
                    query: query,
                    routing: routingDecision,
                    context: existingContext,
                    executionPattern: this.determineExecutionPattern(analysis.routing)
                });
            } else {
                // Direct agent execution fallback
                orchestrationResult = await this.executeAgentDirectly(routingDecision.primaryAgent, query, existingContext);
            }

            // Transform existing system response to CSM format
            return this.transformToCSMFormat(orchestrationResult, analysis);

        } catch (error) {
            this.logger.error('Existing agent processing failed', {
                error: error.message,
                query: query
            });
            
            // Return fallback response
            return this.createFallbackCSMResponse(query, analysis, error);
        }
    }

    /**
     * Determine agent from query when routing fails
     */
    determineAgentFromQuery(query) {
        const queryLower = query.toLowerCase();
        
        if (queryLower.includes('sled') || queryLower.includes('state') || queryLower.includes('local')) {
            return 'sled-markets';
        } else if (queryLower.includes('federal') || queryLower.includes('government')) {
            return 'federal-opportunities';
        } else if (queryLower.includes('alert')) {
            return 'alert-manager';
        } else if (queryLower.includes('report')) {
            return 'report-generator';
        } else {
            return 'search-orchestrator';
        }
    }

    /**
     * Execute agent directly if orchestrator fails
     */
    async executeAgentDirectly(agentId, query, context) {
        try {
            // Try to load and execute the specific agent
            let agent = null;
            let AgentClass = null;

            switch (agentId) {
                case 'sled-markets':
                    AgentClass = require('../agents/domain/sled-markets-agent');
                    break;
                case 'federal-opportunities':
                    AgentClass = require('../agents/domain/federal-opportunities-agent');
                    break;
                case 'search-orchestrator':
                    AgentClass = require('../agents/workflow/search-orchestrator-agent');
                    break;
                case 'alert-manager':
                    AgentClass = require('../agents/workflow/alert-manager-agent');
                    break;
                case 'report-generator':
                    AgentClass = require('../agents/workflow/report-generator-agent');
                    break;
                default:
                    throw new Error(`Unknown agent: ${agentId}`);
            }

            // Handle different export patterns
            if (typeof AgentClass === 'function') {
                agent = new AgentClass();
            } else if (AgentClass.default) {
                agent = new AgentClass.default();
            } else {
                // Try to find the class in the exports
                const className = Object.keys(AgentClass).find(key => 
                    key.includes('Agent') || key.includes('agent')
                );
                if (className && typeof AgentClass[className] === 'function') {
                    agent = new AgentClass[className]();
                }
            }

            if (!agent) {
                throw new Error(`Could not instantiate agent: ${agentId}`);
            }

            // Try different method names
            const methods = ['processQuery', 'process', 'execute', 'handleQuery'];
            for (const method of methods) {
                if (typeof agent[method] === 'function') {
                    const result = await agent[method](query, context);
                    return {
                        agentId: agentId,
                        agentResponses: [result],
                        success: true
                    };
                }
            }

            throw new Error(`No compatible method found for agent: ${agentId}`);

        } catch (error) {
            this.logger.warn('Direct agent execution failed', {
                agentId,
                error: error.message
            });
            
            return {
                agentId: agentId,
                agentResponses: [],
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Transform orchestration result to CSM format
     */
    transformToCSMFormat(orchestrationResult, analysis) {
        const csmGuidance = [];

        // Handle successful orchestration
        if (orchestrationResult && orchestrationResult.success !== false) {
            if (orchestrationResult.agentResponses && Array.isArray(orchestrationResult.agentResponses)) {
                orchestrationResult.agentResponses.forEach(agentResponse => {
                    const csmResponse = this.convertAgentResponseToCSMGuidance(agentResponse, analysis);
                    if (csmResponse) {
                        csmGuidance.push(csmResponse);
                    }
                });
            } else if (orchestrationResult.agentId) {
                // Single agent response
                const csmResponse = this.convertAgentResponseToCSMGuidance(orchestrationResult, analysis);
                if (csmResponse) {
                    csmGuidance.push(csmResponse);
                }
            }
        }

        // If no valid responses, create fallback
        if (csmGuidance.length === 0) {
            csmGuidance.push(this.createDefaultGuidanceResponse(analysis));
        }

        return csmGuidance;
    }

    /**
     * Convert agent response to CSM guidance
     */
    convertAgentResponseToCSMGuidance(agentResponse, analysis) {
        const agentName = agentResponse.agentId || agentResponse.agent || 'UNKNOWN_AGENT';
        
        let guidanceType = 'general_guidance';
        let nextSteps = [];
        let csmContent = '';

        // Extract content from different response formats
        if (typeof agentResponse === 'string') {
            csmContent = agentResponse;
        } else if (agentResponse.content) {
            csmContent = agentResponse.content;
        } else if (agentResponse.response) {
            csmContent = agentResponse.response;
        } else if (agentResponse.searchStrategy) {
            csmContent = agentResponse.searchStrategy;
        } else if (agentResponse.recommendations) {
            csmContent = Array.isArray(agentResponse.recommendations) ? 
                agentResponse.recommendations.join('\n') : agentResponse.recommendations;
        }

        // Add GovWin navigation context
        if (csmContent && !csmContent.includes('GovWin')) {
            csmContent = this.addNavigationGuidance(csmContent, agentName);
        }

        // Determine guidance type and next steps
        if (agentName.includes('sled')) {
            guidanceType = 'sled_navigation';
            nextSteps = [
                'Navigate to SLED Opportunities in GovWin IQ',
                'Apply geographic and sector filters',
                'Review procurement cycles and requirements',
                'Set up opportunity alerts'
            ];
        } else if (agentName.includes('federal')) {
            guidanceType = 'federal_navigation';
            nextSteps = [
                'Access Federal Opportunities in GovWin IQ',
                'Set agency and industry filters',
                'Review opportunity requirements',
                'Create monitoring alerts'
            ];
        } else if (agentName.includes('search')) {
            guidanceType = 'search_guidance';
            nextSteps = [
                'Use Advanced Search in GovWin IQ',
                'Apply relevant search filters',
                'Save successful search criteria',
                'Set up automated monitoring'
            ];
        }

        return {
            agent: this.mapAgentToCSMAgent(agentName),
            content: csmContent || this.getDefaultContentByAgent(agentName),
            guidanceType: guidanceType,
            nextSteps: nextSteps,
            confidence: agentResponse.confidence || 0.8,
            originalAgent: agentName,
            role: 'primary'
        };
    }

    /**
     * Add navigation guidance to content
     */
    addNavigationGuidance(content, agentName) {
        let prefix = "I'll help you navigate this in GovWin IQ:\n\n";
        let suffix = "\n\nWould you like me to walk you through any of these steps in GovWin IQ?";
        
        if (agentName.includes('sled')) {
            prefix = "I'll guide you through SLED opportunities in GovWin IQ:\n\n";
        } else if (agentName.includes('federal')) {
            prefix = "I'll help you navigate federal opportunities in GovWin IQ:\n\n";
        }

        return prefix + content + suffix;
    }

    /**
     * Map agent names to CSM agents
     */
    mapAgentToCSMAgent(agentName) {
        if (agentName.includes('sled')) return 'SLED_GUIDANCE';
        if (agentName.includes('federal')) return 'FEDERAL_GUIDANCE';
        if (agentName.includes('search')) return 'SEARCH_GUIDANCE';
        if (agentName.includes('alert')) return 'ALERT_GUIDANCE';
        if (agentName.includes('report')) return 'REPORT_GUIDANCE';
        return 'GENERAL_GUIDANCE';
    }

    /**
     * Get default content by agent
     */
    getDefaultContentByAgent(agentName) {
        if (agentName.includes('sled')) {
            return "I can help you navigate SLED opportunities in GovWin IQ:\n\n1. Go to 'Opportunities' → 'Advanced Search'\n2. Set Market to 'SLED'\n3. Select geographic and sector filters\n4. Execute your search\n\nWould you like detailed guidance on any of these steps?";
        } else if (agentName.includes('federal')) {
            return "I'll help you navigate federal opportunities in GovWin IQ:\n\n1. Go to 'Opportunities' → 'Advanced Search'\n2. Set Market filter to 'Federal'\n3. Add agency and industry filters\n4. Execute search and review results\n\nWould you like more detailed guidance on any of these steps?";
        } else {
            return "I'm here to help you navigate GovWin IQ effectively. What specific area would you like guidance on?";
        }
    }

    /**
     * Create default guidance response
     */
    createDefaultGuidanceResponse(analysis) {
        const intent = analysis.analysis.intent.type;
        const domains = analysis.analysis.domains.map(d => d.type);

        let content = "I'll help you navigate GovWin IQ. ";
        let guidanceType = 'general_guidance';
        let nextSteps = [];

        if (domains.includes('FEDERAL')) {
            content += "For federal opportunities, I can guide you through the federal search process in GovWin IQ.";
            guidanceType = 'federal_navigation';
            nextSteps = [
                'Access Federal Opportunities search',
                'Apply agency and industry filters',
                'Review opportunity details',
                'Set up monitoring alerts'
            ];
        } else if (domains.includes('SLED')) {
            content += "For state and local opportunities, I can guide you through the SLED search process in GovWin IQ.";
            guidanceType = 'sled_navigation';
            nextSteps = [
                'Access SLED Opportunities search',
                'Set geographic and sector filters',
                'Review procurement cycles',
                'Create opportunity alerts'
            ];
        } else {
            content += "I can guide you through finding opportunities, setting up searches, and understanding platform features in GovWin IQ.";
            nextSteps = [
                'Choose your focus area (federal or SLED)',
                'Get specific navigation guidance',
                'Set up ongoing monitoring'
            ];
        }

        return {
            agent: 'GENERAL_GUIDANCE',
            content: content,
            guidanceType: guidanceType,
            nextSteps: nextSteps,
            confidence: 0.7,
            role: 'primary'
        };
    }

    /**
     * Create fallback response for system errors
     */
    createFallbackCSMResponse(query, analysis, error) {
        return [{
            agent: 'SYSTEM_FALLBACK',
            content: "I'm here to help you navigate GovWin IQ. While I process your request, I can provide general guidance on finding opportunities, setting up searches, or understanding platform features. What specific area would you like help with?",
            guidanceType: 'fallback_guidance',
            nextSteps: [
                'Let me know your specific goal',
                'I can provide step-by-step navigation guidance',
                'We can also connect you with a Customer Success Manager'
            ],
            confidence: 0.5,
            role: 'primary',
            fallbackReason: error.message
        }];
    }

    /**
     * Determine execution pattern
     */
    determineExecutionPattern(routing) {
        if (routing && routing.secondaryAgents && routing.secondaryAgents.length > 0) {
            return 'parallel';
        } else if (routing && routing.requiresClarification) {
            return 'conditional';
        } else {
            return 'sequential';
        }
    }
}

module.exports = ExistingAgentBridge;
