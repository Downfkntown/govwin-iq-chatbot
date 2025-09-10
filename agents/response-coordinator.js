/**
 * GovWin IQ Response Coordinator
 * 
 * Combines outputs from multiple agents into coherent, unified responses:
 * - Multi-agent response synthesis
 * - Content prioritization and ranking
 * - Conflict resolution between agent outputs
 * - Response formatting and structuring
 * - Consistency checking and validation
 * - Context-aware response composition
 */

const { agentRegistry } = require('./agent-registry');
const { contextManager } = require('./context-manager');

// Response composition strategies
const CompositionStrategies = {
    SEQUENTIAL: 'sequential',           // Present responses in order
    PRIORITIZED: 'prioritized',         // Order by priority/confidence
    INTEGRATED: 'integrated',           // Blend responses together
    COMPARATIVE: 'comparative',         // Show different perspectives
    CONSOLIDATED: 'consolidated',       // Merge similar content
    HIERARCHICAL: 'hierarchical'        // Organize by importance/topic
};

// Response types
const ResponseTypes = {
    INFORMATIONAL: 'informational',
    ACTIONABLE: 'actionable',
    ANALYTICAL: 'analytical',
    COMPARATIVE: 'comparative',
    SUMMARY: 'summary',
    ERROR: 'error',
    PARTIAL: 'partial'
};

// Content priorities
const ContentPriorities = {
    CRITICAL: 1,    // Must include
    HIGH: 2,        // Important to include
    MEDIUM: 3,      // Include if space allows
    LOW: 4,         // Optional content
    SUPPLEMENTARY: 5 // Additional context
};

class ResponseCoordinator {
    constructor() {
        this.responseHistory = new Map();
        this.templates = new Map();
        this.formatters = new Map();
        this.validators = new Map();
        this.conflictResolvers = new Map();
        
        this.maxResponseLength = 2000;
        this.minConfidenceThreshold = 0.3;
        this.maxAgentResponses = 5;
        
        this.initializeTemplates();
        this.initializeFormatters();
        this.initializeValidators();
        this.initializeConflictResolvers();
    }

    /**
     * Initialize response templates
     */
    initializeTemplates() {
        this.templates.set('single_agent', {
            structure: ['introduction', 'main_content', 'conclusion'],
            maxSections: 3,
            requiresAttribution: false
        });

        this.templates.set('multi_agent_sequential', {
            structure: ['introduction', 'agent_responses', 'synthesis', 'conclusion'],
            maxSections: 6,
            requiresAttribution: true,
            sectionSeparator: '\n\n'
        });

        this.templates.set('comparative_analysis', {
            structure: ['introduction', 'perspectives', 'comparison', 'recommendation'],
            maxSections: 8,
            requiresAttribution: true,
            showConflicts: true
        });

        this.templates.set('consolidated_summary', {
            structure: ['executive_summary', 'key_points', 'details', 'next_steps'],
            maxSections: 4,
            requiresAttribution: false,
            prioritizeContent: true
        });

        this.templates.set('analytical_report', {
            structure: ['overview', 'analysis', 'findings', 'implications', 'recommendations'],
            maxSections: 5,
            requiresAttribution: true,
            includeMetrics: true
        });
    }

    /**
     * Initialize content formatters
     */
    initializeFormatters() {
        this.formatters.set('markdown', {
            header: (level, text) => `${'#'.repeat(level)} ${text}\n\n`,
            list: (items) => items.map(item => `• ${item}`).join('\n') + '\n\n',
            emphasis: (text) => `**${text}**`,
            quote: (text) => `> ${text}\n\n`,
            code: (text) => `\`${text}\``,
            link: (text, url) => `[${text}](${url})`
        });

        this.formatters.set('html', {
            header: (level, text) => `<h${level}>${text}</h${level}>`,
            list: (items) => `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`,
            emphasis: (text) => `<strong>${text}</strong>`,
            quote: (text) => `<blockquote>${text}</blockquote>`,
            code: (text) => `<code>${text}</code>`,
            link: (text, url) => `<a href="${url}">${text}</a>`
        });

        this.formatters.set('plain', {
            header: (level, text) => `${text.toUpperCase()}\n${'='.repeat(text.length)}\n\n`,
            list: (items) => items.map((item, i) => `${i + 1}. ${item}`).join('\n') + '\n\n',
            emphasis: (text) => text.toUpperCase(),
            quote: (text) => `"${text}"`,
            code: (text) => text,
            link: (text, url) => `${text} (${url})`
        });
    }

    /**
     * Initialize response validators
     */
    initializeValidators() {
        this.validators.set('consistency', (responses) => {
            const facts = new Map();
            const conflicts = [];

            responses.forEach(response => {
                if (response.facts) {
                    response.facts.forEach(fact => {
                        const existing = facts.get(fact.key);
                        if (existing && existing.value !== fact.value) {
                            conflicts.push({
                                type: 'fact_conflict',
                                key: fact.key,
                                values: [existing.value, fact.value],
                                sources: [existing.source, response.agentId]
                            });
                        } else {
                            facts.set(fact.key, { ...fact, source: response.agentId });
                        }
                    });
                }
            });

            return { valid: conflicts.length === 0, conflicts };
        });

        this.validators.set('completeness', (responses, originalQuery) => {
            const requiredTopics = this.extractRequiredTopics(originalQuery);
            const coveredTopics = new Set();

            responses.forEach(response => {
                if (response.topics) {
                    response.topics.forEach(topic => coveredTopics.add(topic));
                }
            });

            const missingTopics = requiredTopics.filter(topic => !coveredTopics.has(topic));
            
            return {
                valid: missingTopics.length === 0,
                coverage: (coveredTopics.size / requiredTopics.length) * 100,
                missingTopics
            };
        });

        this.validators.set('relevance', (responses, context) => {
            const relevanceScores = responses.map(response => {
                let score = response.confidence || 0.5;
                
                // Boost score if response matches user domain interests
                if (context.user && context.user.domains && response.domain) {
                    const userDomainInterest = context.user.domains[response.domain];
                    if (userDomainInterest && userDomainInterest.experience !== 'unknown') {
                        score += 0.2;
                    }
                }

                // Check topic relevance
                if (context.conversation && context.conversation.currentTopic && response.topics) {
                    const topicMatch = response.topics.includes(context.conversation.currentTopic);
                    if (topicMatch) score += 0.15;
                }

                return Math.min(score, 1.0);
            });

            const averageRelevance = relevanceScores.reduce((sum, score) => sum + score, 0) / relevanceScores.length;
            
            return {
                valid: averageRelevance >= this.minConfidenceThreshold,
                averageRelevance,
                scores: relevanceScores
            };
        });
    }

    /**
     * Initialize conflict resolvers
     */
    initializeConflictResolvers() {
        this.conflictResolvers.set('priority_based', (conflicts) => {
            return conflicts.map(conflict => {
                const highestPrioritySource = conflict.sources
                    .map(source => ({ source, priority: this.getAgentPriority(source) }))
                    .sort((a, b) => a.priority - b.priority)[0];
                
                return {
                    ...conflict,
                    resolution: 'priority',
                    resolvedValue: conflict.values[conflict.sources.indexOf(highestPrioritySource.source)],
                    resolvedSource: highestPrioritySource.source
                };
            });
        });

        this.conflictResolvers.set('confidence_based', (conflicts) => {
            return conflicts.map(conflict => {
                // In a real implementation, this would use actual confidence scores
                const mostConfidentSource = conflict.sources[0]; // Simplified
                
                return {
                    ...conflict,
                    resolution: 'confidence',
                    resolvedValue: conflict.values[0],
                    resolvedSource: mostConfidentSource
                };
            });
        });

        this.conflictResolvers.set('consensus_based', (conflicts) => {
            return conflicts.map(conflict => {
                const valueCounts = new Map();
                conflict.values.forEach(value => {
                    valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
                });
                
                const [consensusValue] = [...valueCounts.entries()]
                    .sort(([,a], [,b]) => b - a)[0];
                
                return {
                    ...conflict,
                    resolution: 'consensus',
                    resolvedValue: consensusValue,
                    consensusStrength: valueCounts.get(consensusValue) / conflict.values.length
                };
            });
        });
    }

    /**
     * Main coordination method - combines multiple agent responses
     */
    async coordinateResponses(responses, options = {}) {
        const coordinationRequest = {
            id: this.generateCoordinationId(),
            timestamp: new Date(),
            responses,
            options: {
                strategy: options.strategy || CompositionStrategies.PRIORITIZED,
                format: options.format || 'markdown',
                maxLength: options.maxLength || this.maxResponseLength,
                includeAttribution: options.includeAttribution !== false,
                showConfidences: options.showConfidences || false,
                template: options.template || 'multi_agent_sequential',
                context: options.context || {},
                ...options
            }
        };

        try {
            // Step 1: Validate and filter responses
            const validResponses = await this.validateResponses(responses, coordinationRequest.options);

            // Step 2: Detect and resolve conflicts
            const conflicts = await this.detectConflicts(validResponses);
            const resolvedConflicts = conflicts.length > 0 
                ? await this.resolveConflicts(conflicts, coordinationRequest.options)
                : [];

            // Step 3: Prioritize and rank content
            const prioritizedContent = await this.prioritizeContent(validResponses, coordinationRequest.options);

            // Step 4: Compose unified response
            const composedResponse = await this.composeResponse(
                prioritizedContent, 
                resolvedConflicts, 
                coordinationRequest.options
            );

            // Step 5: Format and finalize
            const finalResponse = await this.formatResponse(composedResponse, coordinationRequest.options);

            // Record coordination for analytics
            this.recordCoordination(coordinationRequest, finalResponse);

            return {
                success: true,
                response: finalResponse,
                metadata: {
                    coordinationId: coordinationRequest.id,
                    strategy: coordinationRequest.options.strategy,
                    sourceResponses: responses.length,
                    validResponses: validResponses.length,
                    conflictsResolved: resolvedConflicts.length,
                    confidence: this.calculateOverallConfidence(validResponses),
                    completeness: this.calculateCompleteness(validResponses, coordinationRequest.options)
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                fallbackResponse: this.generateFallbackResponse(responses, options),
                metadata: {
                    coordinationId: coordinationRequest.id,
                    error: true
                }
            };
        }
    }

    /**
     * Validate responses for quality and relevance
     */
    async validateResponses(responses, options) {
        const validResponses = [];

        for (const response of responses) {
            // Basic validation
            if (!response || !response.content || response.content.trim().length === 0) {
                continue;
            }

            // Confidence threshold check
            if (response.confidence && response.confidence < this.minConfidenceThreshold) {
                continue;
            }

            // Run custom validators
            let isValid = true;
            const validationResults = {};

            for (const [validatorName, validator] of this.validators) {
                try {
                    const result = validator([response], options.originalQuery || '', options.context || {});
                    validationResults[validatorName] = result;
                    
                    if (!result.valid) {
                        isValid = false;
                        break;
                    }
                } catch (error) {
                    console.warn(`Validator ${validatorName} failed:`, error);
                }
            }

            if (isValid) {
                validResponses.push({
                    ...response,
                    validationResults
                });
            }
        }

        return validResponses.slice(0, this.maxAgentResponses);
    }

    /**
     * Detect conflicts between responses
     */
    async detectConflicts(responses) {
        const conflicts = [];

        // Check for factual conflicts
        const consistencyResult = this.validators.get('consistency')(responses);
        if (!consistencyResult.valid) {
            conflicts.push(...consistencyResult.conflicts);
        }

        // Check for contradictory recommendations
        const recommendations = responses
            .filter(r => r.recommendations)
            .flatMap(r => r.recommendations.map(rec => ({ ...rec, source: r.agentId })));

        const contradictions = this.findContradictoryRecommendations(recommendations);
        conflicts.push(...contradictions);

        return conflicts;
    }

    /**
     * Resolve conflicts between responses
     */
    async resolveConflicts(conflicts, options) {
        const resolverName = options.conflictResolution || 'priority_based';
        const resolver = this.conflictResolvers.get(resolverName);

        if (!resolver) {
            throw new Error(`Unknown conflict resolver: ${resolverName}`);
        }

        return resolver(conflicts);
    }

    /**
     * Prioritize content from multiple responses
     */
    async prioritizeContent(responses, options) {
        const contentItems = [];

        responses.forEach(response => {
            // Extract main content
            contentItems.push({
                type: 'main_content',
                content: response.content,
                priority: this.calculateContentPriority(response, 'main'),
                confidence: response.confidence || 0.5,
                agentId: response.agentId,
                source: response
            });

            // Extract recommendations
            if (response.recommendations) {
                response.recommendations.forEach(rec => {
                    contentItems.push({
                        type: 'recommendation',
                        content: rec,
                        priority: this.calculateContentPriority(response, 'recommendation'),
                        confidence: response.confidence || 0.5,
                        agentId: response.agentId,
                        source: response
                    });
                });
            }

            // Extract key facts
            if (response.facts) {
                response.facts.forEach(fact => {
                    contentItems.push({
                        type: 'fact',
                        content: fact,
                        priority: this.calculateContentPriority(response, 'fact'),
                        confidence: response.confidence || 0.5,
                        agentId: response.agentId,
                        source: response
                    });
                });
            }
        });

        // Sort by priority and confidence
        return contentItems.sort((a, b) => {
            if (a.priority !== b.priority) {
                return a.priority - b.priority; // Lower priority number = higher priority
            }
            return b.confidence - a.confidence; // Higher confidence first
        });
    }

    /**
     * Compose unified response from prioritized content
     */
    async composeResponse(prioritizedContent, resolvedConflicts, options) {
        const template = this.templates.get(options.template) || this.templates.get('multi_agent_sequential');
        const composition = {
            template: options.template,
            sections: [],
            conflicts: resolvedConflicts,
            totalLength: 0
        };

        // Group content by type and agent
        const contentGroups = this.groupContent(prioritizedContent);

        // Build response sections based on template
        for (const sectionType of template.structure) {
            const section = await this.buildSection(
                sectionType, 
                contentGroups, 
                options, 
                composition
            );

            if (section && section.content) {
                composition.sections.push(section);
                composition.totalLength += section.content.length;

                // Check length limits
                if (composition.totalLength > options.maxLength) {
                    break;
                }
            }
        }

        return composition;
    }

    /**
     * Build individual response section
     */
    async buildSection(sectionType, contentGroups, options, composition) {
        switch (sectionType) {
            case 'introduction':
                return this.buildIntroductionSection(contentGroups, options);

            case 'main_content':
                return this.buildMainContentSection(contentGroups, options);

            case 'agent_responses':
                return this.buildAgentResponsesSection(contentGroups, options);

            case 'synthesis':
                return this.buildSynthesisSection(contentGroups, options);

            case 'perspectives':
                return this.buildPerspectivesSection(contentGroups, options);

            case 'comparison':
                return this.buildComparisonSection(contentGroups, options);

            case 'recommendations':
                return this.buildRecommendationsSection(contentGroups, options);

            case 'conclusion':
                return this.buildConclusionSection(contentGroups, options);

            case 'next_steps':
                return this.buildNextStepsSection(contentGroups, options);

            default:
                return null;
        }
    }

    /**
     * Build introduction section
     */
    buildIntroductionSection(contentGroups, options) {
        const agentCount = Object.keys(contentGroups.byAgent || {}).length;
        const hasConflicts = options.conflicts && options.conflicts.length > 0;

        let intro = '';
        if (agentCount > 1) {
            intro = `Based on analysis from ${agentCount} specialized agents, here's a comprehensive response to your query`;
            if (hasConflicts) {
                intro += ' (conflicting information has been resolved)';
            }
            intro += ':';
        } else {
            intro = 'Here\'s the analysis for your query:';
        }

        return {
            type: 'introduction',
            content: intro,
            metadata: { agentCount, hasConflicts }
        };
    }

    /**
     * Build main content section
     */
    buildMainContentSection(contentGroups, options) {
        const mainContent = contentGroups.byType?.main_content || [];
        if (mainContent.length === 0) return null;

        const content = mainContent
            .slice(0, 3) // Limit to top 3 main content items
            .map(item => item.content)
            .join('\n\n');

        return {
            type: 'main_content',
            content,
            metadata: { sourceCount: mainContent.length }
        };
    }

    /**
     * Build agent responses section
     */
    buildAgentResponsesSection(contentGroups, options) {
        if (!contentGroups.byAgent) return null;

        const sections = [];
        
        Object.entries(contentGroups.byAgent).forEach(([agentId, items]) => {
            const agent = agentRegistry[agentId];
            const agentName = agent?.name || agentId;
            
            const agentContent = items
                .filter(item => item.type === 'main_content')
                .map(item => item.content)
                .join('\n');

            if (agentContent) {
                let section = `**${agentName} Analysis:**\n${agentContent}`;
                
                if (options.showConfidences) {
                    const avgConfidence = items.reduce((sum, item) => sum + item.confidence, 0) / items.length;
                    section += `\n*Confidence: ${(avgConfidence * 100).toFixed(0)}%*`;
                }
                
                sections.push(section);
            }
        });

        return {
            type: 'agent_responses',
            content: sections.join('\n\n'),
            metadata: { agentCount: sections.length }
        };
    }

    /**
     * Build synthesis section
     */
    buildSynthesisSection(contentGroups, options) {
        const keyPoints = this.extractKeyPoints(contentGroups);
        if (keyPoints.length === 0) return null;

        const synthesis = [
            '**Key Insights:**',
            ...keyPoints.map((point, i) => `${i + 1}. ${point}`)
        ].join('\n');

        return {
            type: 'synthesis',
            content: synthesis,
            metadata: { keyPointCount: keyPoints.length }
        };
    }

    /**
     * Build recommendations section
     */
    buildRecommendationsSection(contentGroups, options) {
        const recommendations = contentGroups.byType?.recommendation || [];
        if (recommendations.length === 0) return null;

        const uniqueRecs = this.deduplicateRecommendations(recommendations);
        const content = [
            '**Recommendations:**',
            ...uniqueRecs.slice(0, 5).map((rec, i) => `${i + 1}. ${rec.content}`)
        ].join('\n');

        return {
            type: 'recommendations',
            content,
            metadata: { recommendationCount: uniqueRecs.length }
        };
    }

    /**
     * Format final response
     */
    async formatResponse(composition, options) {
        const formatter = this.formatters.get(options.format) || this.formatters.get('markdown');
        const sections = [];

        composition.sections.forEach(section => {
            if (section.content) {
                sections.push(section.content);
            }
        });

        let finalContent = sections.join('\n\n');

        // Add attribution if required
        if (options.includeAttribution && composition.sections.length > 0) {
            const agents = this.extractUniqueAgents(composition);
            if (agents.length > 1) {
                finalContent += '\n\n' + formatter.emphasis(`Analysis provided by: ${agents.join(', ')}`);
            }
        }

        // Add conflict resolution notice if applicable
        if (composition.conflicts && composition.conflicts.length > 0 && options.showConflicts) {
            finalContent += '\n\n*Note: Some conflicting information was resolved using priority-based resolution.*';
        }

        return {
            content: finalContent,
            format: options.format,
            sections: composition.sections.length,
            length: finalContent.length,
            conflicts: composition.conflicts.length,
            timestamp: new Date()
        };
    }

    /**
     * Utility methods
     */
    generateCoordinationId() {
        return `coord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    calculateContentPriority(response, contentType) {
        const agent = agentRegistry[response.agentId];
        let priority = ContentPriorities.MEDIUM;

        // Adjust based on agent priority
        if (agent?.priority === 'critical') priority = ContentPriorities.CRITICAL;
        else if (agent?.priority === 'high') priority = ContentPriorities.HIGH;
        else if (agent?.priority === 'low') priority = ContentPriorities.LOW;

        // Adjust based on content type
        if (contentType === 'main_content') priority = Math.max(priority - 1, ContentPriorities.CRITICAL);
        if (contentType === 'fact') priority = Math.max(priority - 1, ContentPriorities.CRITICAL);

        return priority;
    }

    getAgentPriority(agentId) {
        const agent = agentRegistry[agentId];
        const priorityMap = { critical: 1, high: 2, medium: 3, low: 4 };
        return priorityMap[agent?.priority] || 3;
    }

    groupContent(contentItems) {
        const byType = {};
        const byAgent = {};

        contentItems.forEach(item => {
            // Group by type
            if (!byType[item.type]) byType[item.type] = [];
            byType[item.type].push(item);

            // Group by agent
            if (!byAgent[item.agentId]) byAgent[item.agentId] = [];
            byAgent[item.agentId].push(item);
        });

        return { byType, byAgent };
    }

    extractKeyPoints(contentGroups) {
        const keyPoints = [];
        const mainContent = contentGroups.byType?.main_content || [];
        
        // Simple extraction - in a real implementation, this would use NLP
        mainContent.forEach(item => {
            if (typeof item.content === 'string') {
                const sentences = item.content.split('. ');
                const importantSentences = sentences.filter(s => 
                    s.length > 30 && s.length < 150
                ).slice(0, 2);
                keyPoints.push(...importantSentences);
            }
        });

        return keyPoints.slice(0, 5);
    }

    extractUniqueAgents(composition) {
        const agents = new Set();
        
        composition.sections.forEach(section => {
            if (section.metadata?.agentId) {
                const agent = agentRegistry[section.metadata.agentId];
                agents.add(agent?.name || section.metadata.agentId);
            }
        });

        return Array.from(agents);
    }

    deduplicateRecommendations(recommendations) {
        const unique = new Map();
        
        recommendations.forEach(rec => {
            const key = typeof rec.content === 'string' 
                ? rec.content.toLowerCase().trim()
                : JSON.stringify(rec.content);
            
            if (!unique.has(key) || rec.confidence > unique.get(key).confidence) {
                unique.set(key, rec);
            }
        });

        return Array.from(unique.values());
    }

    calculateOverallConfidence(responses) {
        if (responses.length === 0) return 0;
        
        const confidences = responses.map(r => r.confidence || 0.5);
        return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
    }

    calculateCompleteness(responses, options) {
        // Simple completeness metric - could be enhanced
        const totalContent = responses.reduce((sum, r) => sum + (r.content?.length || 0), 0);
        const expectedMinLength = 200; // Minimum expected content length
        
        return Math.min((totalContent / expectedMinLength) * 100, 100);
    }

    extractRequiredTopics(query) {
        // Simple topic extraction - in a real implementation, use NLP
        const topics = [];
        const commonTopics = [
            'federal', 'sled', 'contract', 'opportunity', 'pricing', 
            'compliance', 'relationship', 'market', 'analysis'
        ];
        
        const lowerQuery = query.toLowerCase();
        commonTopics.forEach(topic => {
            if (lowerQuery.includes(topic)) {
                topics.push(topic);
            }
        });
        
        return topics.length > 0 ? topics : ['general'];
    }

    findContradictoryRecommendations(recommendations) {
        // Simple contradiction detection
        const contradictions = [];
        // Implementation would compare recommendations for conflicts
        return contradictions;
    }

    generateFallbackResponse(responses, options) {
        if (responses.length === 0) {
            return {
                content: "I apologize, but I wasn't able to generate a response to your query. Please try rephrasing your question or contact support if the issue persists.",
                format: options.format || 'markdown',
                fallback: true
            };
        }

        // Use the highest confidence response as fallback
        const bestResponse = responses
            .filter(r => r.content)
            .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))[0];

        return {
            content: bestResponse?.content || "Unable to generate response",
            format: options.format || 'markdown',
            fallback: true,
            source: bestResponse?.agentId
        };
    }

    recordCoordination(request, response) {
        this.responseHistory.set(request.id, {
            request,
            response,
            timestamp: new Date()
        });

        // Keep only last 100 coordinations
        if (this.responseHistory.size > 100) {
            const oldest = this.responseHistory.keys().next().value;
            this.responseHistory.delete(oldest);
        }
    }

    /**
     * Get coordination statistics
     */
    getStats() {
        const history = Array.from(this.responseHistory.values());
        
        return {
            totalCoordinations: history.length,
            averageResponseLength: this.calculateAverageResponseLength(history),
            mostUsedStrategy: this.getMostUsedStrategy(history),
            averageSourceCount: this.calculateAverageSourceCount(history),
            successRate: this.calculateSuccessRate(history),
            conflictResolutionRate: this.calculateConflictResolutionRate(history)
        };
    }

    calculateAverageResponseLength(history) {
        if (history.length === 0) return 0;
        
        const lengths = history.map(h => h.response?.length || 0);
        return lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    }

    getMostUsedStrategy(history) {
        const strategies = {};
        
        history.forEach(h => {
            const strategy = h.request?.options?.strategy || 'unknown';
            strategies[strategy] = (strategies[strategy] || 0) + 1;
        });

        return Object.entries(strategies)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';
    }

    calculateAverageSourceCount(history) {
        if (history.length === 0) return 0;
        
        const counts = history.map(h => h.request?.responses?.length || 0);
        return counts.reduce((sum, count) => sum + count, 0) / counts.length;
    }

    calculateSuccessRate(history) {
        if (history.length === 0) return 0;
        
        const successful = history.filter(h => !h.response?.fallback).length;
        return (successful / history.length) * 100;
    }

    calculateConflictResolutionRate(history) {
        const withConflicts = history.filter(h => 
            h.response?.conflicts && h.response.conflicts > 0
        ).length;
        
        return history.length > 0 ? (withConflicts / history.length) * 100 : 0;
    }
}

// Export singleton instance
const responseCoordinator = new ResponseCoordinator();

module.exports = {
    ResponseCoordinator,
    responseCoordinator,
    CompositionStrategies,
    ResponseTypes,
    ContentPriorities
};