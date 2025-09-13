/**
 * Simplified bridge that works with your existing agent structure
 * Falls back gracefully when agents can't be loaded
 */

class SimpleExistingBridge {
    constructor(logger) {
        this.logger = logger;
        this.availableAgents = new Map();
        this.initializeSafely();
    }

    /**
     * Safely initialize available agents
     */
    initializeSafely() {
        // Try to load each agent individually and note which ones work
        this.tryLoadAgent('sled-markets', '../agents/domain/sled-markets-agent');
        this.tryLoadAgent('federal-opportunities', '../agents/domain/federal-opportunities-agent');
        this.tryLoadAgent('regional-local', '../agents/domain/regional-local-markets-agent');
        this.tryLoadAgent('search-orchestrator', '../agents/workflow/search-orchestrator-agent');
        this.tryLoadAgent('alert-manager', '../agents/workflow/alert-manager-agent');
        this.tryLoadAgent('report-generator', '../agents/workflow/report-generator-agent');
        
        this.logger.info('Available agents loaded', {
            loadedAgents: Array.from(this.availableAgents.keys()),
            totalAvailable: this.availableAgents.size
        });
    }

    /**
     * Try to load an individual agent
     */
    tryLoadAgent(agentId, modulePath) {
        try {
            const AgentClass = require(modulePath);
            
            // Handle different export patterns
            let agent;
            if (typeof AgentClass === 'function') {
                agent = new AgentClass();
            } else if (AgentClass.default && typeof AgentClass.default === 'function') {
                agent = new AgentClass.default();
            } else if (AgentClass[Object.keys(AgentClass)[0]]) {
                const FirstClass = AgentClass[Object.keys(AgentClass)[0]];
                if (typeof FirstClass === 'function') {
                    agent = new FirstClass();
                }
            }
            
            if (agent && agent.agentId) {
                this.availableAgents.set(agentId, agent);
                this.logger.debug('Agent loaded successfully', { agentId, agentName: agent.name });
            }
            
        } catch (error) {
            this.logger.debug('Agent failed to load', { 
                agentId, 
                error: error.message 
            });
        }
    }

    /**
     * Process query with available agents
     */
    async processWithExistingAgents(query, analysis, sessionContext = {}) {
        const queryLower = query.toLowerCase();
        let selectedAgent = null;
        let agentId = null;

        // Determine which agent to use based on query analysis
        if (analysis.analysis.targetAgent) {
            selectedAgent = this.availableAgents.get(analysis.analysis.targetAgent);
            agentId = analysis.analysis.targetAgent;
        } else {
            // Fallback agent selection
            if (queryLower.includes('sled') || queryLower.includes('state') || queryLower.includes('local') || queryLower.includes('education')) {
                selectedAgent = this.availableAgents.get('sled-markets');
                agentId = 'sled-markets';
            } else if (queryLower.includes('federal') || queryLower.includes('government')) {
                selectedAgent = this.availableAgents.get('federal-opportunities');
                agentId = 'federal-opportunities';
            } else if (queryLower.includes('alert')) {
                selectedAgent = this.availableAgents.get('alert-manager');
                agentId = 'alert-manager';
            } else if (queryLower.includes('report')) {
                selectedAgent = this.availableAgents.get('report-generator');
                agentId = 'report-generator';
            } else {
                selectedAgent = this.availableAgents.get('search-orchestrator');
                agentId = 'search-orchestrator';
            }
        }

        // If we have an available agent, try to use it
        if (selectedAgent) {
            try {
                const result = await this.callExistingAgent(selectedAgent, query, analysis, sessionContext);
                return this.transformToCSMFormat(result, agentId, analysis);
            } catch (error) {
                this.logger.warn('Agent call failed, using fallback', {
                    agentId,
                    error: error.message
                });
            }
        }

        // Fallback to basic CSM guidance
        return this.generateFallbackGuidance(query, analysis);
    }

    /**
     * Call existing agent with flexible interface
     */
    async callExistingAgent(agent, query, analysis, sessionContext) {
        // Try different method names your agents might have
        const possibleMethods = ['processQuery', 'process', 'execute', 'handleQuery', 'respond'];
        
        for (const methodName of possibleMethods) {
            if (typeof agent[methodName] === 'function') {
                try {
                    // Try different parameter patterns
                    const context = {
                        user: analysis.analysis.entities,
                        conversationHistory: analysis.conversationHistory || [],
                        sessionContext: sessionContext
                    };
                    
                    return await agent[methodName](query, context);
                } catch (error) {
                    this.logger.debug('Agent method failed', {
                        method: methodName,
                        error: error.message
                    });
                    continue;
                }
            }
        }
        
        throw new Error('No compatible agent method found');
    }

    /**
     * Transform agent response to CSM format
     */
    transformToCSMFormat(agentResult, agentId, analysis) {
        let csmContent = '';
        let nextSteps = [];
        let guidanceType = 'general_guidance';

        // Handle different response formats
        if (typeof agentResult === 'string') {
            csmContent = agentResult;
        } else if (agentResult && typeof agentResult === 'object') {
            if (agentResult.content) {
                csmContent = agentResult.content;
            } else if (agentResult.response) {
                csmContent = agentResult.response;
            } else if (agentResult.searchStrategy) {
                csmContent = agentResult.searchStrategy;
            } else if (agentResult.recommendations) {
                csmContent = Array.isArray(agentResult.recommendations) ? 
                    agentResult.recommendations.join('\n') : agentResult.recommendations;
            }

            if (agentResult.nextSteps) {
                nextSteps = Array.isArray(agentResult.nextSteps) ? 
                    agentResult.nextSteps : [agentResult.nextSteps];
            }
        }

        // Add CSM navigation context
        if (csmContent && !csmContent.includes('GovWin')) {
            csmContent = this.addGovWinNavigationContext(csmContent, agentId);
        }

        // Determine guidance type and add navigation steps
        if (agentId === 'sled-markets') {
            guidanceType = 'sled_navigation';
            if (nextSteps.length === 0) {
                nextSteps = [
                    'Navigate to SLED Opportunities in GovWin IQ',
                    'Set geographic and market filters',
                    'Review procurement cycles',
                    'Set up monitoring alerts'
                ];
            }
        } else if (agentId === 'federal-opportunities') {
            guidanceType = 'federal_navigation';
            if (nextSteps.length === 0) {
                nextSteps = [
                    'Access Federal Opportunities in GovWin IQ',
                    'Apply agency and industry filters',
                    'Review opportunity requirements',
                    'Create opportunity alerts'
                ];
            }
        } else if (agentId === 'search-orchestrator') {
            guidanceType = 'search_guidance';
            if (nextSteps.length === 0) {
                nextSteps = [
                    'Use Advanced Search in GovWin IQ',
                    'Apply relevant filters',
                    'Save search criteria',
                    'Set up automated monitoring'
                ];
            }
        }

        return [{
            agent: this.mapAgentToCSMName(agentId),
            content: csmContent || this.getDefaultGuidanceByAgent(agentId),
            guidanceType: guidanceType,
            nextSteps: nextSteps,
            confidence: agentResult?.confidence || 0.8,
            originalAgent: agentId,
            role: 'primary'
        }];
    }

    /**
     * Add GovWin navigation context to existing content
     */
    addGovWinNavigationContext(content, agentId) {
        let prefix = "I'll help you navigate this in GovWin IQ:\n\n";
        
        if (agentId === 'sled-markets') {
            prefix = "I'll guide you through SLED opportunities in GovWin IQ:\n\n";
        } else if (agentId === 'federal-opportunities') {
            prefix = "I'll help you navigate federal opportunities in GovWin IQ:\n\n";
        }

        return prefix + content + "\n\nWould you like me to walk you through any of these steps in more detail?";
    }

    /**
     * Generate fallback guidance when no agents are available
     */
    generateFallbackGuidance(query, analysis) {
        const queryLower = query.toLowerCase();
        let guidanceType = 'general_guidance';
        let content = '';
        let nextSteps = [];

        if (queryLower.includes('federal')) {
            guidanceType = 'federal_navigation';
            content = "I'll help you navigate federal opportunities in GovWin IQ:\n\n1. Go to 'Opportunities' → 'Advanced Search'\n2. Set Market filter to 'Federal'\n3. Add agency and industry filters\n4. Execute search and review results\n\nWould you like detailed guidance on any of these steps?";
            nextSteps = ['Access Federal Advanced Search', 'Apply filters', 'Review results', 'Set up alerts'];
        } else if (queryLower.includes('state') || queryLower.includes('local') || queryLower.includes('sled')) {
            guidanceType = 'sled_navigation';
            content = "I'll guide you through SLED opportunities in GovWin IQ:\n\n1. Navigate to 'Opportunities' → 'Advanced Search'\n2. Set Market to 'SLED'\n3. Select geographic and sector filters\n4. Execute search\n\nSLED markets have unique procurement cycles - would you like guidance on timing?";
            nextSteps = ['Access SLED Search', 'Set geographic filters', 'Review cycles', 'Create alerts'];
        } else {
            content = "I'm here to help you navigate GovWin IQ effectively! I can guide you through:\n\n• Finding opportunities (federal and SLED)\n• Setting up advanced searches\n• Creating opportunity alerts\n• Understanding platform features\n\nWhat would you like to start with?";
            nextSteps = ['Choose your focus area', 'Get specific guidance', 'Set up monitoring'];
        }

        return [{
            agent: 'GENERAL_GUIDANCE',
            content: content,
            guidanceType: guidanceType,
            nextSteps: nextSteps,
            confidence: 0.7,
            role: 'primary'
        }];
    }

    /**
     * Map agent IDs to CSM names
     */
    mapAgentToCSMName(agentId) {
        const mapping = {
            'sled-markets': 'SLED_GUIDANCE',
            'federal-opportunities': 'FEDERAL_GUIDANCE',
            'regional-local': 'REGIONAL_GUIDANCE',
            'search-orchestrator': 'SEARCH_GUIDANCE',
            'alert-manager': 'ALERT_GUIDANCE',
            'report-generator': 'REPORT_GUIDANCE'
        };
        return mapping[agentId] || 'GENERAL_GUIDANCE';
    }

    /**
     * Get default guidance by agent
     */
    getDefaultGuidanceByAgent(agentId) {
        const defaults = {
            'sled-markets': 'I can help you navigate SLED opportunities in GovWin IQ.',
            'federal-opportunities': 'I can guide you through federal opportunity discovery.',
            'search-orchestrator': 'I can help you set up effective searches in GovWin IQ.',
            'alert-manager': 'I can guide you through setting up opportunity alerts.',
            'report-generator': 'I can help you create reports and analysis.'
        };
        return defaults[agentId] || 'I\'m here to help you navigate GovWin IQ effectively.';
    }

    /**
     * Get available agents list
     */
    getAvailableAgents() {
        return Array.from(this.availableAgents.keys());
    }
}

module.exports = SimpleExistingBridge;
