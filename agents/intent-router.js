const { agentRegistry, matchAgentByTrigger, getActiveAgents, findAgentByExpertise, findAgentsByCapability } = require('./agent-registry');

const IntentPatterns = {
  // Domain-specific intents
  FEDERAL_INTENT: {
    patterns: [
      /(?:federal|government\s+agency|GSA|DoD|FAR)/i,
      /(?:federal\s+contract|acquisition|compliance)/i,
      /(?:SEWP|CIO-SP3|government\s+wide)/i
/(?:federal.*(?:opportunity|opportunities|modernization|IT))/i,
/(?:government.*(?:technology|modernization|digital))/i,
/(?:federal.*(?:budget|million|funding))/i
    ],
    weight: 0.9,
    agent: 'federal',
    keywords: ['federal', 'FAR', 'agency', 'compliance', 'acquisition']
  },

  SLED_INTENT: {
    patterns: [
      /(?:SLED|state|local|education|municipal)/i,
      /(?:school\s+district|university|K-12|county|city)/i,
      /(?:state\s+procurement|local\s+government)/i
    ],
    weight: 0.9,
    agent: 'sled',
    keywords: ['SLED', 'state', 'local', 'education', 'municipal']
  },

  CONTRACT_INTENT: {
    patterns: [
      /(?:contract|pricing|terms|negotiation)/i,
      /(?:RFP|RFQ|proposal|bid|award)/i,
      /(?:SOW|risk\s+assessment|contract\s+analysis)/i
    ],
    weight: 0.85,
    agent: 'contractIntelligence',
    keywords: ['contract', 'pricing', 'terms', 'RFP', 'proposal']
  },

  RELATIONSHIP_INTENT: {
    patterns: [
      /(?:relationship|stakeholder|contact|network)/i,
      /(?:decision\s+maker|partner|client)/i,
      /(?:stakeholder\s+mapping|relationship\s+management)/i
    ],
    weight: 0.8,
    agent: 'relationshipManagement',
    keywords: ['relationship', 'stakeholder', 'contact', 'network']
  },

  SEARCH_INTENT: {
    patterns: [
      /(?:search|find|look(?:ing)?\s+for|locate|where\s+(?:is|can|do))/i,
      /(?:show\s+me|tell\s+me\s+about|information\s+(?:on|about))/i,
      /(?:what\s+is|how\s+to\s+find|knowledge\s+(?:about|on))/i
    ],
    weight: 0.8,
    agent: 'searchOrchestrator',
    keywords: ['search', 'find', 'lookup', 'query']
  },

  OPPORTUNITY_INTENT: {
    patterns: [
      /(?:opportunity|pipeline|track|deadline)/i,
      /(?:milestone|monitor|opportunity\s+tracking)/i,
      /(?:pipeline\s+management|opportunity\s+scoring)/i
    ],
    weight: 0.85,
    agent: 'opportunityTracker',
    keywords: ['opportunity', 'pipeline', 'deadline', 'milestone']
  },

  ALERT_INTENT: {
    patterns: [
      /(?:alert|notification|notify|reminder)/i,
      /(?:set\s+alert|notification\s+settings)/i,
      /(?:alert\s+configuration|reminder\s+system)/i
    ],
    weight: 0.8,
    agent: 'alertManager',
    keywords: ['alert', 'notification', 'notify', 'reminder']
  },

  REPORT_INTENT: {
    patterns: [
      /(?:report|analytics|dashboard|export)/i,
      /(?:generate\s+report|data\s+visualization|chart|graph)/i,
      /(?:analytics\s+dashboard|custom\s+report)/i
    ],
    weight: 0.8,
    agent: 'reportGenerator',
    keywords: ['report', 'analytics', 'dashboard', 'export']
  },

  RESEARCH_INTENT: {
    patterns: [
      /(?:research|market|competitive|intelligence)/i,
      /(?:market\s+analysis|competitive\s+landscape|trend)/i,
      /(?:market\s+intelligence|industry\s+insights)/i
    ],
    weight: 0.8,
    agent: 'marketResearcher',
    keywords: ['research', 'market', 'competitive', 'intelligence']
  },

  SUPPORT_INTENT: {
    patterns: [
      /(?:help|support|how\s+to|tutorial|guide)/i,
      /(?:problem|issue|error|troubleshoot)/i,
      /(?:training|assistance|need\s+help)/i
    ],
    weight: 0.85,
    agent: 'technicalSupport',
    keywords: ['help', 'support', 'tutorial', 'guide', 'problem']
  },

  // Legacy intents for backward compatibility
  GOVWIN_FEATURE_INTENT: {
    patterns: [
      /(?:govwin|gw|government\s+winning)/i,
      /(?:feature|functionality|capability|tool)/i,
      /(?:how\s+(?:do\s+i|to)|tutorial|guide|instructions)/i,
      /(?:dashboard|report|analysis|opportunity|bid)/i
    ],
    weight: 0.9,
    agent: 'govwinExpert',
    keywords: ['govwin', 'feature', 'functionality']
  },

  ONBOARDING_INTENT: {
    patterns: [
      /(?:new\s+(?:to|user)|getting\s+started|first\s+time)/i,
      /(?:setup|configure|install|onboard)/i,
      /(?:welcome|introduction|begin|start)/i,
      /(?:account|login|access|credentials)/i
    ],
    weight: 0.75,
    agent: 'onboardingAssistant',
    keywords: ['new', 'setup', 'getting started', 'onboard']
  },

  CONVERSATION_CONTROL_INTENT: {
    patterns: [
      /(?:menu|options|what\s+can\s+you|capabilities)/i,
      /(?:help\s+me|main\s+menu|start\s+over|restart)/i,
      /(?:back|previous|return|go\s+back)/i
    ],
    weight: 0.7,
    agent: 'conversationManager',
    keywords: ['menu', 'options', 'capabilities']
  }
};

const QuestionTypes = {
  WHAT: /^what\s+(?:is|are|does|do)/i,
  HOW: /^how\s+(?:do|to|can)/i,
  WHERE: /^where\s+(?:is|can|do)/i,
  WHY: /^why\s+(?:is|does|do)/i,
  WHEN: /^when\s+(?:is|does|do)/i,
  WHO: /^who\s+(?:is|can|does)/i
};

const ContextKeywords = {
  URGENT: ['urgent', 'asap', 'immediately', 'critical', 'emergency', 'priority', 'fast'],
  TECHNICAL: ['api', 'integration', 'code', 'developer', 'technical', 'system', 'platform'],
  BUSINESS: ['sales', 'revenue', 'roi', 'business', 'strategy', 'growth', 'profit'],
  TRAINING: ['learn', 'training', 'course', 'tutorial', 'guide', 'instruction', 'documentation'],
  FEDERAL: ['federal', 'government', 'agency', 'GSA', 'DoD', 'FAR', 'acquisition'],
  SLED: ['SLED', 'state', 'local', 'education', 'municipal', 'county', 'city', 'school'],
  CONTRACTS: ['contract', 'RFP', 'RFQ', 'proposal', 'bid', 'award', 'pricing', 'terms'],
  OPPORTUNITIES: ['opportunity', 'pipeline', 'deadline', 'milestone', 'track', 'monitor'],
  ALERTS: ['alert', 'notification', 'reminder', 'notify', 'warning'],
  REPORTS: ['report', 'analytics', 'dashboard', 'export', 'data', 'visualization'],
  SEARCH: ['search', 'find', 'lookup', 'query', 'locate', 'discover'],
  RELATIONSHIPS: ['relationship', 'stakeholder', 'contact', 'network', 'partner']
};

class IntentRouter {
  constructor() {
    this.confidenceThreshold = 0.35;
    this.multiAgentThreshold = 0.7;
    this.contextHistory = [];
    this.sessionContexts = new Map();
    this.maxContextHistory = 10;
  }

  analyzeIntent(userInput, sessionId = null, sessionContext = {}) {
    const analysis = {
      originalInput: userInput,
      normalizedInput: this.normalizeInput(userInput),
      confidence: 0,
      primaryAgent: null,
      secondaryAgents: [],
      intentType: null,
      questionType: this.identifyQuestionType(userInput),
      context: this.extractContext(userInput),
      urgency: this.assessUrgency(userInput),
      sessionContext,
      sessionId,
      timestamp: new Date()
    };

    // Calculate intent scores with enhanced keyword matching
    const intentScores = this.calculateIntentScores(analysis.normalizedInput);
    const keywordScores = this.calculateKeywordScores(analysis.normalizedInput);
    const triggerMatch = matchAgentByTrigger(userInput);

    // Combine scores for better accuracy
    const combinedScores = this.combineScores(intentScores, keywordScores);

    // Apply session context if available
    if (sessionId) {
      this.applySessionContext(combinedScores, sessionId);
    }

    analysis.confidence = Math.max(...Object.values(combinedScores));
    analysis.primaryAgent = this.selectPrimaryAgent(combinedScores, triggerMatch);
    analysis.secondaryAgents = this.selectSecondaryAgents(combinedScores, analysis.primaryAgent);
    analysis.intentType = this.determineIntentType(combinedScores);
    analysis.routing = this.determineRoutingStrategy(combinedScores, analysis);

    this.updateContextHistory(analysis, sessionId);

    return analysis;
  }

  /**
   * Calculate keyword-based scores for enhanced matching
   */
  calculateKeywordScores(normalizedInput) {
    const scores = {};
    
    Object.entries(ContextKeywords).forEach(([category, keywords]) => {
      let categoryScore = 0;
      keywords.forEach(keyword => {
        if (normalizedInput.includes(keyword.toLowerCase())) {
          categoryScore += 0.3;
        }
      });
      
      if (categoryScore > 0) {
        // Map category to agent
        const agentKey = this.mapCategoryToAgent(category);
        if (agentKey) {
          scores[agentKey] = (scores[agentKey] || 0) + Math.min(categoryScore, 1.0);
        }
      }
    });

    return scores;
  }

  /**
   * Map keyword category to agent
   */
  mapCategoryToAgent(category) {
    const mapping = {
      'FEDERAL': 'federal',
      'SLED': 'sled',
      'CONTRACTS': 'contractIntelligence',
      'OPPORTUNITIES': 'opportunityTracker',
      'ALERTS': 'alertManager',
      'REPORTS': 'reportGenerator',
      'SEARCH': 'searchOrchestrator',
      'RELATIONSHIPS': 'relationshipManagement',
      'TECHNICAL': 'technicalSupport',
      'TRAINING': 'technicalSupport',
      'BUSINESS': 'marketResearcher'
    };
    return mapping[category];
  }

  /**
   * Combine intent and keyword scores
   */
  combineScores(intentScores, keywordScores) {
    const combined = { ...intentScores };
    
    Object.entries(keywordScores).forEach(([agent, score]) => {
      combined[agent] = (combined[agent] || 0) + (score * 0.4);
    });

    return combined;
  }

  /**
   * Apply session context to boost relevant agents
   */
  applySessionContext(scores, sessionId) {
    const sessionHistory = this.sessionContexts.get(sessionId);
    if (sessionHistory && sessionHistory.length > 0) {
      // Boost scores for recently used agents
      const recentAgents = sessionHistory.slice(-3).map(entry => entry.primaryAgent);
      recentAgents.forEach(agent => {
        if (scores[agent]) {
          scores[agent] += 0.1;
        }
      });
    }
  }

  /**
   * Determine routing strategy (single vs multi-agent)
   */
  determineRoutingStrategy(scores, analysis) {
    const sortedScores = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .filter(([,score]) => score >= this.confidenceThreshold);

    if (sortedScores.length === 0) {
      return this.getDefaultRouting();
    }

    const [primaryAgent, primaryScore] = sortedScores[0];
    
    const routing = {
      strategy: 'single',
      primary: {
        agent: primaryAgent,
        confidence: Math.min(primaryScore, 1.0)
      },
      secondary: [],
      reasoning: this.generateRoutingReasoning(primaryAgent, primaryScore, analysis)
    };

    // Check for multi-agent routing
    if (primaryScore >= this.multiAgentThreshold && sortedScores.length > 1) {
      const secondaryAgents = sortedScores.slice(1, 3)
        .filter(([,score]) => score >= this.confidenceThreshold * 0.8);
      
      if (secondaryAgents.length > 0) {
        routing.strategy = 'multi';
        routing.secondary = secondaryAgents.map(([agent, score]) => ({
          agent,
          confidence: Math.min(score, 1.0)
        }));
      }
    }

    return routing;
  }

  /**
   * Generate reasoning for routing decision
   */
  generateRoutingReasoning(agent, confidence, analysis) {
    const agentInfo = agentRegistry[agent];
    let reasoning = `Routed to ${agentInfo?.name || agent} (confidence: ${(confidence * 100).toFixed(1)}%)`;
    
    if (analysis.intentType) {
      reasoning += ` based on ${analysis.intentType.toLowerCase().replace(/_/g, ' ')}`;
    }
    
    if (analysis.urgency === 'high') {
      reasoning += ` with high urgency`;
    }
    
    return reasoning;
  }

  /**
   * Get default routing when no clear match
   */
  getDefaultRouting() {
    return {
      strategy: 'default',
      primary: {
        agent: 'conversationManager',
        confidence: 0.6
      },
      secondary: [{
        agent: 'technicalSupport',
        confidence: 0.4
      }],
      reasoning: 'No clear intent detected, routing to conversation manager'
    };
  }

  normalizeInput(input) {
    return input
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  identifyQuestionType(input) {
    for (const [type, pattern] of Object.entries(QuestionTypes)) {
      if (pattern.test(input)) {
        return type;
      }
    }
    return 'STATEMENT';
  }

  extractContext(input) {
    const context = {
      keywords: [],
      entities: [],
      sentiment: 'neutral'
    };

    for (const [category, keywords] of Object.entries(ContextKeywords)) {
      const matches = keywords.filter(keyword => 
        input.toLowerCase().includes(keyword)
      );
      if (matches.length > 0) {
        context.keywords.push({ category, matches });
      }
    }

    context.entities = this.extractEntities(input);
    context.sentiment = this.analyzeSentiment(input);

    return context;
  }

  extractEntities(input) {
    const entities = [];
    
    const govwinFeatures = [
      'dashboard', 'reports', 'opportunities', 'bids', 'pipeline',
      'analytics', 'forecasting', 'competitor', 'market intelligence'
    ];
    
    govwinFeatures.forEach(feature => {
      if (input.toLowerCase().includes(feature)) {
        entities.push({ type: 'GOVWIN_FEATURE', value: feature });
      }
    });

    return entities;
  }

  analyzeSentiment(input) {
    const positiveWords = ['good', 'great', 'excellent', 'perfect', 'love', 'like'];
    const negativeWords = ['bad', 'terrible', 'hate', 'frustrated', 'annoyed', 'broken'];
    
    const words = input.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    if (negativeCount > positiveCount) return 'negative';
    if (positiveCount > negativeCount) return 'positive';
    return 'neutral';
  }

  assessUrgency(input) {
    const urgentIndicators = ContextKeywords.URGENT;
    const hasUrgentKeywords = urgentIndicators.some(keyword => 
      input.toLowerCase().includes(keyword)
    );
    
    if (hasUrgentKeywords) return 'high';
    
    if (input.includes('?') && input.length < 50) return 'medium';
    
    return 'low';
  }

  calculateIntentScores(normalizedInput) {
    const scores = {};
    
    for (const [intentName, intentConfig] of Object.entries(IntentPatterns)) {
      let score = 0;
      let matchCount = 0;
      
      for (const pattern of intentConfig.patterns) {
        if (pattern.test(normalizedInput)) {
          matchCount++;
        }
      }
      
      if (matchCount > 0) {
        score = (matchCount / intentConfig.patterns.length) * intentConfig.weight;
      }
      
      scores[intentConfig.agent] = Math.max(scores[intentConfig.agent] || 0, score);
    }
    
    return scores;
  }

  selectPrimaryAgent(intentScores, triggerMatch) {
    if (triggerMatch && intentScores[triggerMatch.key] >= this.confidenceThreshold) {
      return triggerMatch.key;
    }
    
    const sortedScores = Object.entries(intentScores)
      .sort(([,a], [,b]) => b - a);
    
    if (sortedScores.length > 0 && sortedScores[0][1] >= this.confidenceThreshold) {
      return sortedScores[0][0];
    }
    
    return 'conversationManager';
  }

  selectSecondaryAgents(intentScores, primaryAgent) {
    return Object.entries(intentScores)
      .filter(([agent, score]) => 
        agent !== primaryAgent && 
        score >= this.confidenceThreshold * 0.7
      )
      .sort(([,a], [,b]) => b - a)
      .map(([agent]) => agent)
      .slice(0, 2);
  }

  determineIntentType(intentScores) {
    const maxScore = Math.max(...Object.values(intentScores));
    
    for (const [intentName, intentConfig] of Object.entries(IntentPatterns)) {
      if (intentScores[intentConfig.agent] === maxScore) {
        return intentName;
      }
    }
    
    return 'GENERAL_INQUIRY';
  }

  updateContextHistory(analysis, sessionId) {
    // Update global context history
    this.contextHistory.unshift({
      timestamp: Date.now(),
      sessionId,
      agent: analysis.primaryAgent,
      intentType: analysis.intentType,
      confidence: analysis.confidence,
      query: analysis.originalInput
    });
    
    if (this.contextHistory.length > this.maxContextHistory) {
      this.contextHistory.pop();
    }

    // Update session-specific context
    if (sessionId) {
      if (!this.sessionContexts.has(sessionId)) {
        this.sessionContexts.set(sessionId, []);
      }
      
      const sessionHistory = this.sessionContexts.get(sessionId);
      sessionHistory.unshift({
        timestamp: Date.now(),
        primaryAgent: analysis.primaryAgent,
        intentType: analysis.intentType,
        confidence: analysis.confidence,
        routing: analysis.routing
      });

      if (sessionHistory.length > this.maxContextHistory) {
        sessionHistory.pop();
      }
    }
  }

  /**
   * Main routing method - enhanced version of getRoutingDecision
   */
  routeQuery(userInput, sessionId = null, sessionContext = {}) {
    const analysis = this.analyzeIntent(userInput, sessionId, sessionContext);
    
    const routing = {
      query: userInput,
      sessionId,
      timestamp: analysis.timestamp,
      analysis: {
        normalizedInput: analysis.normalizedInput,
        intentType: analysis.intentType,
        questionType: analysis.questionType,
        urgency: analysis.urgency,
        context: analysis.context,
        confidence: analysis.confidence
      },
      routing: analysis.routing,
      selectedAgent: analysis.primaryAgent,
      fallbackAgents: analysis.secondaryAgents,
      requiresHumanHandoff: this.shouldEscalateToHuman(analysis),
      metadata: {
        strategy: analysis.routing?.strategy || 'single',
        reasoning: analysis.routing?.reasoning || 'Default routing applied',
        sessionHistory: this.getSessionSummary(sessionId)
      }
    };
    
    return routing;
  }

  /**
   * Legacy method for backward compatibility
   */
  getRoutingDecision(userInput, sessionContext = {}) {
    const routing = this.routeQuery(userInput, null, sessionContext);
    
    return {
      selectedAgent: routing.selectedAgent,
      confidence: routing.analysis.confidence,
      reasoning: routing.metadata.reasoning,
      fallbackAgents: routing.fallbackAgents,
      requiresHumanHandoff: routing.requiresHumanHandoff,
      metadata: {
        intentType: routing.analysis.intentType,
        questionType: routing.analysis.questionType,
        urgency: routing.analysis.urgency,
        context: routing.analysis.context
      }
    };
  }

  /**
   * Get session summary for metadata
   */
  getSessionSummary(sessionId) {
    if (!sessionId || !this.sessionContexts.has(sessionId)) {
      return null;
    }

    const history = this.sessionContexts.get(sessionId);
    return {
      totalInteractions: history.length,
      recentAgents: history.slice(0, 3).map(entry => entry.primaryAgent),
      averageConfidence: history.length > 0 
        ? history.reduce((sum, entry) => sum + entry.confidence, 0) / history.length 
        : 0
    };
  }

  /**
   * Clear session context
   */
  clearSession(sessionId) {
    if (sessionId) {
      this.sessionContexts.delete(sessionId);
    }
  }

  /**
   * Get routing statistics
   */
  getRoutingStats() {
    return {
      totalSessions: this.sessionContexts.size,
      totalQueries: this.contextHistory.length,
      averageConfidence: this.contextHistory.length > 0
        ? this.contextHistory.reduce((sum, entry) => sum + entry.confidence, 0) / this.contextHistory.length
        : 0,
      topAgents: this.getTopAgents(),
      topIntents: this.getTopIntents()
    };
  }

  /**
   * Get most frequently used agents
   */
  getTopAgents() {
    const agentCounts = this.contextHistory.reduce((counts, entry) => {
      counts[entry.agent] = (counts[entry.agent] || 0) + 1;
      return counts;
    }, {});

    return Object.entries(agentCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([agent, count]) => ({ agent, count }));
  }

  /**
   * Get most frequently detected intents
   */
  getTopIntents() {
    const intentCounts = this.contextHistory.reduce((counts, entry) => {
      if (entry.intentType) {
        counts[entry.intentType] = (counts[entry.intentType] || 0) + 1;
      }
      return counts;
    }, {});

    return Object.entries(intentCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([intent, count]) => ({ intent, count }));
  }

  generateReasoning(analysis) {
    const reasons = [];
    
    if (analysis.confidence >= 0.8) {
      reasons.push(`High confidence match (${(analysis.confidence * 100).toFixed(1)}%)`);
    } else if (analysis.confidence >= this.confidenceThreshold) {
      reasons.push(`Moderate confidence match (${(analysis.confidence * 100).toFixed(1)}%)`);
    } else {
      reasons.push('Low confidence - routing to conversation manager');
    }
    
    if (analysis.intentType) {
      reasons.push(`Intent: ${analysis.intentType.replace(/_/g, ' ').toLowerCase()}`);
    }
    
    if (analysis.questionType !== 'STATEMENT') {
      reasons.push(`Question type: ${analysis.questionType.toLowerCase()}`);
    }
    
    if (analysis.urgency === 'high') {
      reasons.push('Urgent request detected');
    }
    
    return reasons.join('; ');
  }

  shouldEscalateToHuman(analysis) {
    return (
      analysis.context.sentiment === 'negative' &&
      analysis.urgency === 'high' &&
      analysis.primaryAgent === 'customerSupport'
    );
  }

  getContextHistory() {
    return [...this.contextHistory];
  }

  clearContextHistory() {
    this.contextHistory = [];
    this.sessionContexts.clear();
  }
}

// Export singleton instance and class
const intentRouter = new IntentRouter();

module.exports = {
  IntentRouter,
  intentRouter,
  IntentPatterns,
  ContextKeywords,
  QuestionTypes
};