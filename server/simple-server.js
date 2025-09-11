const express = require('express');
const cors = require('cors');
const path = require('path');
const SearchAssistanceFlow = require('../conversation-flows/search-assistance.js');
const FAQService = require('../rag/faq-service.js');
const VectorStore = require('../rag/vector-store.js');

// Import agent coordination system
const { agentRegistry } = require('../agents/agent-registry.js');
const { intentRouter } = require('../agents/intent-router.js');
const { agentOrchestrator } = require('../agents/agent-orchestrator.js');
const { contextManager } = require('../agents/context-manager.js');
const { responseCoordinator } = require('../agents/response-coordinator.js');

const app = express();

// Railway deployment compatibility: use PORT env var and bind to 0.0.0.0
const port = process.env.PORT || process.env.STAGING_PORT || 3001;
const host = process.env.HOST || '0.0.0.0';

// Environment detection
const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';
const isStaging = env === 'staging';
const isRailway = process.env.RAILWAY_ENVIRONMENT || false;

// Trust proxy for Railway deployment
if (isRailway || isProduction) {
  app.set('trust proxy', true);
}

// CORS configuration for Railway deployment
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from Railway domains and configured origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:3002',
      'https://govwin.com',
      'https://www.govwin.com',
      'https://iq.govwin.com',
      'https://staging.govwin.com',
      'https://staging-iq.govwin.com'
    ];
    
    // Add Railway URLs if available
    if (process.env.RAILWAY_STATIC_URL) {
      allowedOrigins.push(process.env.RAILWAY_STATIC_URL);
    }
    if (process.env.RAILWAY_PUBLIC_DOMAIN) {
      allowedOrigins.push(`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
    }
    
    // Add environment-specific CORS origins
    if (process.env.CORS_ORIGIN_STAGING) {
      allowedOrigins.push(...process.env.CORS_ORIGIN_STAGING.split(','));
    }
    
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: process.env.CORS_CREDENTIALS === 'true' || true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: process.env.MAX_REQUEST_SIZE || '10mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_REQUEST_SIZE || '10mb' }));

// Add security middleware for production
if (isProduction || isStaging) {
  try {
    const helmet = require('helmet');
    app.use(helmet({
      contentSecurityPolicy: false, // Disable for API server
      crossOriginEmbedderPolicy: false
    }));
    console.log('✅ Helmet security middleware enabled');
  } catch (error) {
    console.log('⚠️  Helmet not available, skipping security headers');
  }
  
  try {
    const compression = require('compression');
    app.use(compression());
    console.log('✅ Compression middleware enabled');
  } catch (error) {
    console.log('⚠️  Compression not available, skipping compression');
  }
}

const searchFlow = new SearchAssistanceFlow();
const faqService = new FAQService();
const vectorStore = new VectorStore({
  persistencePath: path.join(__dirname, '..', 'rag', 'govwin-faq-vectors.json'),
  dimension: 200,
  autoSave: true,
  maxVectors: 1000
});

class AgentCoordinatedRAG {
  constructor(faqService, vectorStore) {
    this.faqService = faqService;
    this.vectorStore = vectorStore;
    this.initialized = false;
    this.confidenceThreshold = 0.25;
    this.maxFAQResults = 5;
    this.initPromise = null;
    
    // Agent coordination integration
    this.agentSystem = {
      registry: agentRegistry,
      router: intentRouter,
      orchestrator: agentOrchestrator,
      contextManager: contextManager,
      responseCoordinator: responseCoordinator
    };
  }

  async initialize() {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = this._doInitialize();
    return this.initPromise;
  }

  async _doInitialize() {
    try {
      console.log('🚀 Initializing RAG pipeline...');
      
      console.log('📖 Loading FAQ service...');
      await this.faqService.initialize();
      
      const faqStats = this.faqService.getStats();
      console.log(`✅ FAQ Service ready: ${faqStats.totalItems} items in ${faqStats.categories} categories`);
      
      console.log('🔧 Setting up vector store...');
      await this.populateVectorStore();
      
      const vectorStats = this.vectorStore.getStats();
      console.log(`✅ Vector store ready: ${vectorStats.count} vectors (${vectorStats.categories} categories)`);
      
      this.initialized = true;
      console.log('🎉 RAG pipeline initialized successfully!');
      
    } catch (error) {
      console.error('❌ RAG initialization failed:', error);
      this.initPromise = null;
      throw error;
    }
  }

  async populateVectorStore() {
    const vectorStats = this.vectorStore.getStats();
    
    if (vectorStats.count > 0) {
      console.log(`📊 Vector store already populated with ${vectorStats.count} vectors`);
      return;
    }

    console.log('⚡ Generating embeddings for FAQ items...');
    const batchItems = [];
    let processed = 0;
    let errors = 0;
    
    for (const item of this.faqService.faqData) {
      try {
        const embedding = this.faqService.generateTFIDFVector(
          item.combinedText || (item.title + ' ' + item.content)
        );
        
        batchItems.push({
          id: item.id,
          vector: embedding,
          metadata: {
            title: item.title,
            content: item.content,
            category: item.category,
            keywords: item.keywords,
            section: item.section,
            subsection: item.subsection
          }
        });
        
        processed++;
        if (processed % 10 === 0) {
          console.log(`📈 Processed ${processed}/${this.faqService.faqData.length} embeddings`);
        }
      } catch (error) {
        errors++;
        console.error(`⚠️ Failed to generate embedding for FAQ ${item.id}:`, error.message);
      }
    }

    if (batchItems.length > 0) {
      console.log(`💾 Adding ${batchItems.length} vectors to store...`);
      const result = this.vectorStore.addBatch(batchItems);
      
      if (result.failed > 0) {
        console.warn(`⚠️ ${result.failed} vectors failed to add:`, result.errors);
      }
      
      const saveResult = this.vectorStore.save();
      if (saveResult.saved) {
        console.log(`💾 Vector store saved: ${saveResult.count} vectors (${Math.round(saveResult.size / 1024)}KB)`);
      }
    }

    const finalStats = this.vectorStore.getStats();
    console.log(`✅ Vector store populated: ${finalStats.count} vectors, ${errors} errors`);
  }

  async findFAQMatches(query) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      console.log(`🔍 Searching for: "${query}"`);
      
      const queryEmbedding = this.faqService.generateTFIDFVector(query);
      const queryAnalysis = this.faqService.analyzeQuery(query);
      
      let searchOptions = {
        k: this.maxFAQResults * 2,
        threshold: 0.05,
        includeMetadata: true,
        metric: 'cosine'
      };

      if (queryAnalysis.categories.length === 1) {
        searchOptions.category = queryAnalysis.categories[0];
        console.log(`🎯 Category-focused search: ${queryAnalysis.categories[0]}`);
      }

      const vectorResults = this.vectorStore.search(queryEmbedding, searchOptions);
      
      let fallbackResults = [];
      if (vectorResults.length < this.maxFAQResults) {
        try {
          fallbackResults = await this.faqService.search(query, { 
            maxResults: this.maxFAQResults - vectorResults.length,
            minSimilarity: 0.1
          });
        } catch (fallbackError) {
          console.warn('Fallback search failed:', fallbackError.message);
        }
      }

      const allResults = [
        ...vectorResults.map(result => ({
          id: result.id,
          title: result.metadata.title,
          content: result.metadata.content,
          category: result.metadata.category,
          section: result.metadata.section,
          subsection: result.metadata.subsection,
          confidence: result.score,
          source: 'vector',
          snippet: this.faqService.generateSnippet(result.metadata.content, query)
        })),
        ...fallbackResults.map(result => ({
          ...result,
          confidence: result.similarity || 0,
          source: 'fallback'
        }))
      ];

      const uniqueResults = this.deduplicateResults(allResults);
      const topResults = uniqueResults
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, this.maxFAQResults);

      console.log(`📊 Found ${topResults.length} matches (${vectorResults.length} vector, ${fallbackResults.length} fallback)`);
      
      return topResults;

    } catch (error) {
      console.error('❌ FAQ search failed:', error);
      try {
        const fallbackResults = await this.faqService.search(query, { 
          maxResults: this.maxFAQResults 
        });
        return fallbackResults.map(r => ({ ...r, confidence: r.similarity, source: 'emergency_fallback' }));
      } catch (emergencyError) {
        console.error('❌ Emergency fallback also failed:', emergencyError);
        return [];
      }
    }
  }

deduplicateResults(results) {
    const seen = new Set();
    return results.filter(result => {
      const key = `${result.id}-${result.title}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  detectBusinessIntent(query) {
    const businessPatterns = [
        // Finding opportunities
        /find.*opportunit/i,
        /search.*opportunit/i,
        /look.*for.*contract/i,
        /opportunities.*in/i,
        
        // Market research
        /market.*trend/i,
        /procurement.*trend/i,
        /competitive.*analys/i,
        /market.*analys/i,
        
        // Geographic + sector queries
        /opportunit.*(?:california|texas|florida|new york)/i,
        /(?:education|federal|state|local).*opportunit/i,
        /technology.*procurement/i,
        
        // Help with business tasks
        /help.*me.*find/i,
        /how.*do.*i.*find/i,
        /where.*can.*i.*find/i,
        /who.*are.*the.*decision/i,
        
        // Specific business areas
        /contracting.*in/i,
        /procurement.*process/i,
        /decision.*maker/i,
        /competitive.*landscape/i
    ];
    
    const queryLower = query.toLowerCase();
    return businessPatterns.some(pattern => pattern.test(queryLower));
  }    
  async processQuery(query, sessionId = null, context = {}) {
    const startTime = Date.now();
    
    // Step 1: Route query through intent system
    const routingResult = this.agentSystem.router.routeQuery(query, sessionId, context);
    
    console.log(`🧠 Intent routing: ${routingResult.selectedAgent} (confidence: ${(routingResult.analysis.confidence * 100).toFixed(1)}%)`);
    
    // Step 2: Search FAQ matches (existing RAG functionality)
    const faqMatches = await this.findFAQMatches(query);
    const ragSearchTime = Date.now() - startTime;
    
    // Step 3: Get context for selected agents
    const agentContext = sessionId ? 
      this.agentSystem.contextManager.getContextForAgent(sessionId, routingResult.selectedAgent) :
      { query, timestamp: new Date() };
    
    // Step 4: Prepare agent responses
    const agentResponses = await this.generateAgentResponses(
      query, 
      routingResult, 
      faqMatches, 
      agentContext
    );
    
    // Step 5: Coordinate responses if multiple agents involved
    let coordinatedResponse = null;
    if (agentResponses.length > 1) {
      const coordinationResult = await this.agentSystem.responseCoordinator.coordinateResponses(
        agentResponses,
        {
          strategy: routingResult.routing?.strategy === 'multi' ? 'integrated' : 'prioritized',
          context: agentContext,
          originalQuery: query,
          includeAttribution: true
        }
      );
      
      if (coordinationResult.success) {
        coordinatedResponse = coordinationResult.response;
      }
    }
    
    const totalTime = Date.now() - startTime;
    
    // Classify FAQ results
    const highConfidenceMatches = faqMatches.filter(
      match => match.confidence >= this.confidenceThreshold
    );

    const mediumConfidenceMatches = faqMatches.filter(
      match => match.confidence >= this.confidenceThreshold * 0.6 && match.confidence < this.confidenceThreshold
    );

    const result = {
      // Traditional RAG results
      hasFAQMatch: highConfidenceMatches.length > 0,
      faqResults: faqMatches,
      bestMatch: highConfidenceMatches[0] || null,
      shouldUseFAQ: highConfidenceMatches.length > 0,
      confidence: highConfidenceMatches[0]?.confidence || 0,
      
      // Agent coordination results
      routing: routingResult,
      agentResponses,
      coordinatedResponse,
      
      // Combined metrics
      searchTime: ragSearchTime,
      totalTime,
      stats: {
        totalMatches: faqMatches.length,
        highConfidence: highConfidenceMatches.length,
        mediumConfidence: mediumConfidenceMatches.length,
        threshold: this.confidenceThreshold,
        query,
        agentCount: agentResponses.length,
        coordinationUsed: coordinatedResponse !== null
      }
    };

    // Log results
    if (result.shouldUseFAQ) {
      console.log(`✅ High-confidence FAQ match: ${result.bestMatch.title} (${(result.confidence * 100).toFixed(1)}%)`);
    } else if (mediumConfidenceMatches.length > 0) {
      console.log(`⚠️ Medium-confidence FAQ matches available (${mediumConfidenceMatches.length})`);
    }
    
    console.log(`🤖 Agent response generated by ${routingResult.selectedAgent} (${totalTime}ms total)`);

    return result;
  }

  async generateAgentResponses(query, routingResult, faqMatches, context) {
    const responses = [];
    
    // Primary agent response
    const primaryResponse = await this.generateAgentResponse(
      routingResult.selectedAgent,
      query,
      faqMatches,
      context,
      'primary'
    );
    responses.push(primaryResponse);
    
    // Secondary agent responses if multi-agent routing
    if (routingResult.routing?.strategy === 'multi' && routingResult.fallbackAgents) {
      for (const fallbackAgent of routingResult.fallbackAgents.slice(0, 2)) {
        try {
          const secondaryResponse = await this.generateAgentResponse(
            fallbackAgent,
            query,
            faqMatches,
            context,
            'secondary'
          );
          responses.push(secondaryResponse);
        } catch (error) {
          console.warn(`Secondary agent ${fallbackAgent} failed:`, error.message);
        }
      }
    }
    
    return responses;
  }

  async generateAgentResponse(agentId, query, faqMatches, context, role = 'primary') {
    const agent = this.agentSystem.registry[agentId];
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    
    // Simulate agent processing with RAG-enhanced context
    const relevantFAQs = faqMatches.filter(faq => 
      this.isRelevantForAgent(faq, agentId)
    );
    
    const agentResponse = {
      agentId,
      agentName: agent.name,
      agentType: agent.type,
      role,
      confidence: role === 'primary' ? 0.85 : 0.65,
      
      // Generate content based on agent specialization and FAQ matches
      content: this.generateAgentContent(agent, query, relevantFAQs, context),
      
      // Provide structured data
      domain: agent.scope,
      capabilities: agent.capabilities,
      topics: this.extractTopicsForAgent(query, agentId),
      
      // Include relevant FAQ data
      faqReferences: relevantFAQs.slice(0, 2).map(faq => ({
        id: faq.id,
        title: faq.title,
        confidence: faq.confidence,
        category: faq.category
      })),
      
      // Add recommendations if applicable
      recommendations: this.generateAgentRecommendations(agent, query, relevantFAQs),
      
      // Metadata
      timestamp: new Date(),
      processingTime: Math.random() * 500 + 100 // Simulate processing time
    };
    
    return agentResponse;
  }

  isRelevantForAgent(faq, agentId) {
    const agent = this.agentSystem.registry[agentId];
    if (!agent || !agent.expertise) return true;
    
    // Check if FAQ matches agent expertise
    const faqText = (faq.title + ' ' + faq.category + ' ' + faq.content).toLowerCase();
    return agent.expertise.some(expertise => 
      faqText.includes(expertise.toLowerCase())
    );
  }

  generateAgentContent(agent, query, relevantFAQs, context) {
    let content = '';
    
    // Generate agent-specific response based on expertise
    if (agent.scope === 'federal') {
      content = this.generateFederalAgentContent(query, relevantFAQs);
    } else if (agent.scope === 'sled') {
      content = this.generateSLEDAgentContent(query, relevantFAQs);
    } else if (agent.scope === 'contracts') {
      content = this.generateContractAgentContent(query, relevantFAQs);
    } else if (agent.scope === 'search') {
      content = this.generateSearchAgentContent(query, relevantFAQs);
    } else {
      content = this.generateGenericAgentContent(agent, query, relevantFAQs);
    }
    
    return content;
  }

  generateFederalAgentContent(query, faqs) {
    const federalFAQs = faqs.filter(faq => 
      faq.category?.toLowerCase().includes('federal') ||
      faq.content?.toLowerCase().includes('federal')
    );
    
    if (federalFAQs.length > 0) {
      return `Based on federal contracting expertise and our knowledge base: ${federalFAQs[0].content}. For federal opportunities, consider compliance with FAR regulations and agency-specific requirements.`;
    }
    
    return `From a federal contracting perspective: Your query about "${query}" involves considerations around federal acquisition regulations, agency compliance, and government-wide contracting vehicles. I recommend reviewing current federal opportunities and ensuring proper certifications.`;
  }

  generateSLEDAgentContent(query, faqs) {
    const sledFAQs = faqs.filter(faq => 
      faq.category?.toLowerCase().includes('sled') ||
      faq.content?.toLowerCase().includes('state') ||
      faq.content?.toLowerCase().includes('local') ||
      faq.content?.toLowerCase().includes('education')
    );
    
    if (sledFAQs.length > 0) {
      return `For SLED market opportunities: ${sledFAQs[0].content}. State and local governments often have different procurement processes than federal agencies.`;
    }
    
    return `Regarding "${query}" in the SLED market: State, local, and education sectors each have unique procurement processes and requirements. Consider building relationships with local procurement officials and understanding regional compliance requirements.`;
  }

  generateContractAgentContent(query, faqs) {
    const contractFAQs = faqs.filter(faq => 
      faq.content?.toLowerCase().includes('contract') ||
      faq.content?.toLowerCase().includes('pricing') ||
      faq.content?.toLowerCase().includes('proposal')
    );
    
    if (contractFAQs.length > 0) {
      return `Contract intelligence analysis: ${contractFAQs[0].content}. Key considerations include pricing strategy, risk assessment, and terms negotiation.`;
    }
    
    return `For contract analysis of "${query}": Focus on competitive pricing strategies, risk mitigation, and contract terms that align with your capabilities. Review similar past performance and pricing benchmarks.`;
  }

  generateSearchAgentContent(query, faqs) {
    if (faqs.length > 0) {
      return `Search results coordinated from knowledge base: Found ${faqs.length} relevant matches. ${faqs[0].content}`;
    }
    
    return `Search coordination results: No direct matches found in knowledge base for "${query}". Expanding search parameters and checking related terms.`;
  }

  generateGenericAgentContent(agent, query, faqs) {
    if (faqs.length > 0) {
      return `${agent.name} analysis: ${faqs[0].content}`;
    }
    
    return `${agent.name} perspective on "${query}": Based on my expertise in ${agent.expertise?.join(', ') || 'this domain'}, I recommend a comprehensive approach that considers all relevant factors.`;
  }

  extractTopicsForAgent(query, agentId) {
    const agent = this.agentSystem.registry[agentId];
    if (!agent || !agent.expertise) return [];
    
    const queryLower = query.toLowerCase();
    return agent.expertise.filter(topic => 
      queryLower.includes(topic.toLowerCase())
    );
  }

  generateAgentRecommendations(agent, query, faqs) {
    const recommendations = [];
    
    if (agent.scope === 'federal') {
      recommendations.push('Review federal acquisition regulations (FAR)');
      recommendations.push('Check for relevant federal contracting vehicles');
    } else if (agent.scope === 'sled') {
      recommendations.push('Research state and local procurement requirements');
      recommendations.push('Build relationships with regional procurement offices');
    } else if (agent.scope === 'contracts') {
      recommendations.push('Analyze competitive pricing strategies');
      recommendations.push('Review contract terms and risk factors');
    }
    
    if (faqs.length > 0) {
      recommendations.push(`Review related FAQ: "${faqs[0].title}"`);
    }
    
    return recommendations.slice(0, 3);
  }

  formatFAQResponse(ragResult) {
    if (!ragResult.shouldUseFAQ || !ragResult.bestMatch) {
      return null;
    }

    const match = ragResult.bestMatch;
    
    let response = {
      type: 'faq_response',
      confidence: match.confidence,
      category: match.category,
      section: match.section,
      subsection: match.subsection,
      title: match.title,
      content: match.content,
      snippet: match.snippet,
      source: match.source || 'rag',
      searchTime: ragResult.searchTime,
      additionalResults: ragResult.faqResults.slice(1).map(r => ({
        id: r.id,
        title: r.title,
        category: r.category,
        confidence: r.confidence,
        source: r.source
      }))
    };

    if (ragResult.faqResults.length > 1) {
      response.relatedQuestions = ragResult.faqResults.slice(1, 3).map(r => ({
        title: r.title,
        confidence: r.confidence,
        category: r.category
      }));
    }

    const suggestedActions = this.generateSuggestedActions(match, ragResult.faqResults);
    if (suggestedActions.length > 0) {
      response.suggestedActions = suggestedActions;
    }

    return response;
  }

  generateSuggestedActions(bestMatch, allMatches) {
    const actions = [];
    
    if (bestMatch.category === 'Search Methodology') {
      actions.push({
        type: 'try_search',
        label: 'Try a search',
        description: 'Apply what you learned about searching'
      });
    }
    
    if (bestMatch.category === 'Lead Management Workflow') {
      actions.push({
        type: 'view_opportunities',
        label: 'View My Opportunities',
        description: 'Check your saved opportunities'
      });
    }

    const relatedCategories = [...new Set(allMatches.map(m => m.category))];
    if (relatedCategories.length > 1) {
      actions.push({
        type: 'explore_category',
        label: `Explore ${relatedCategories[1]}`,
        description: `Learn more about ${relatedCategories[1]}`
      });
    }

    return actions;
  }
}

const ragLayer = new AgentCoordinatedRAG(faqService, vectorStore);

ragLayer.initialize().catch(error => {
  console.error('❌ Agent-coordinated RAG initialization failed:', error);
  console.log('⚠️ Server will continue without agent coordination - using basic RAG and SearchAssistanceFlow');
});

app.get('/api/v1/system/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/v1/chat/message', async (req, res) => {
  try {
    const { message, context = {}, sessionId } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Message is required and must be a string' 
      });
    }

    // Create or get session context
    const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let session = null;
    
    if (ragLayer.agentSystem?.contextManager) {
      try {
        session = ragLayer.agentSystem.contextManager.getSession(currentSessionId) ||
                 ragLayer.agentSystem.contextManager.createSession(currentSessionId, context.userId, context);
      } catch (contextError) {
        console.warn('Context manager error:', contextError.message);
      }
    }

    // Process query with agent coordination
    const ragResult = await ragLayer.processQuery(message, currentSessionId, context);
    
    // Add conversation turn to context if available
    if (session && ragLayer.agentSystem?.contextManager) {
      try {
        ragLayer.agentSystem.contextManager.addConversationTurn(currentSessionId, {
          type: 'user_query',
          userQuery: message,
          agentId: ragResult.routing?.selectedAgent,
          intentType: ragResult.routing?.analysis?.intentType,
          confidence: ragResult.routing?.analysis?.confidence,
          timestamp: new Date()
        });
      } catch (turnError) {
        console.warn('Failed to add conversation turn:', turnError.message);
      }
    }
    
    // Check if we have coordinated response or high-confidence FAQ match
    if (ragResult.coordinatedResponse) {
      // Use coordinated multi-agent response
      const responseData = {
        type: 'agent_coordinated',
        message: ragResult.coordinatedResponse.content,
        source: 'agent_coordination',
        agents: ragResult.agentResponses.map(r => ({
          id: r.agentId,
          name: r.agentName,
          role: r.role,
          confidence: r.confidence
        })),
        routing: {
          selectedAgent: ragResult.routing.selectedAgent,
          strategy: ragResult.routing.routing?.strategy,
          confidence: ragResult.routing.analysis?.confidence,
          reasoning: ragResult.routing.metadata?.reasoning
        },
        sessionId: currentSessionId,
        timestamp: new Date().toISOString(),
        performance: {
          totalTime: ragResult.totalTime,
          searchTime: ragResult.searchTime,
          agentCount: ragResult.agentResponses.length,
          coordinationUsed: true
        }
      };

      // Add FAQ context if available
      if (ragResult.faqResults.length > 0) {
        responseData.knowledgeBase = {
          matches: ragResult.faqResults.length,
          topMatch: ragResult.bestMatch,
          references: ragResult.faqResults.slice(0, 3).map(r => ({
            title: r.title,
            category: r.category,
            confidence: r.confidence
          }))
        };
      }

      return res.json(responseData);
    }
    
    if (ragResult.shouldUseFAQ) {
      // High-confidence FAQ match with agent enhancement
      const faqResponse = ragLayer.formatFAQResponse(ragResult);
      const primaryAgent = ragResult.agentResponses[0];
      
      if (faqResponse && primaryAgent) {
        const responseMessage = ragResult.confidence > 0.8 ? 
          `I found exactly what you're looking for about "${message}":` :
          ragResult.confidence > 0.5 ?
          `Based on our knowledge base and ${primaryAgent.agentName} analysis:` :
          `Here's relevant information with expert analysis:`;

        return res.json({
          ...faqResponse,
          source: 'rag_with_agent',
          message: responseMessage,
          agentAnalysis: {
            agent: primaryAgent.agentName,
            perspective: primaryAgent.content,
            recommendations: primaryAgent.recommendations,
            confidence: primaryAgent.confidence
          },
          routing: {
            selectedAgent: ragResult.routing.selectedAgent,
            confidence: ragResult.routing.analysis?.confidence,
            reasoning: ragResult.routing.metadata?.reasoning
          },
          sessionId: currentSessionId,
          timestamp: new Date().toISOString(),
          performance: {
            totalTime: ragResult.totalTime,
            searchTime: ragResult.searchTime,
            confidence: ragResult.confidence,
            matches: ragResult.stats
          }
        });
      }
    }

    // Agent response without high-confidence FAQ
    if (ragResult.agentResponses.length > 0) {
      const primaryAgent = ragResult.agentResponses[0];
      
      const agentResponse = {
        type: 'agent_response',
        message: primaryAgent.content,
        source: 'agent_analysis',
        agent: {
          id: primaryAgent.agentId,
          name: primaryAgent.agentName,
          type: primaryAgent.agentType,
          confidence: primaryAgent.confidence
        },
        recommendations: primaryAgent.recommendations,
        routing: {
          selectedAgent: ragResult.routing.selectedAgent,
          confidence: ragResult.routing.analysis?.confidence,
          reasoning: ragResult.routing.metadata?.reasoning,
          intentType: ragResult.routing.analysis?.intentType
        },
        sessionId: currentSessionId,
        timestamp: new Date().toISOString(),
        performance: {
          totalTime: ragResult.totalTime,
          searchTime: ragResult.searchTime
        }
      };

      // Add FAQ context if available
      if (ragResult.faqResults.length > 0) {
        agentResponse.knowledgeBase = {
          matches: ragResult.faqResults.length,
          suggestedFAQs: ragResult.faqResults.slice(0, 3).map(r => ({
            title: r.title,
            category: r.category,
            confidence: r.confidence
          }))
        };
      }

      return res.json(agentResponse);
    }

    // Fallback to search flow with enhanced context
    const searchResponse = searchFlow.handleUserInput(message, context);
    
    const enhancedResponse = {
      ...searchResponse,
      source: 'search_flow_enhanced',
      sessionId: currentSessionId,
      timestamp: new Date().toISOString(),
      routing: ragResult.routing ? {
        attempted: true,
        selectedAgent: ragResult.routing.selectedAgent,
        confidence: ragResult.routing.analysis?.confidence,
        fallbackReason: 'Agent response not generated'
      } : { attempted: false, reason: 'Routing failed' },
      rag: {
        checked: true,
        matches: ragResult.faqResults.length,
        searchTime: ragResult.searchTime,
        fallbackReason: ragResult.faqResults.length === 0 ? 
          'No FAQ matches found' : 
          `${ragResult.stats.mediumConfidence} medium-confidence matches available`,
        suggestedFAQs: ragResult.faqResults.slice(0, 2).map(r => ({
          title: r.title,
          category: r.category,
          confidence: r.confidence
        }))
      }
    };

    if (ragResult.faqResults.length > 0) {
      enhancedResponse.alternativeAnswers = ragResult.faqResults.slice(0, 2);
    }

    res.json(enhancedResponse);

  } catch (error) {
    console.error('Error processing chat message:', error);
    
    try {
      const fallbackResponse = searchFlow.handleUserInput(req.body.message || '');
      res.json({
        ...fallbackResponse,
        source: 'search_flow_fallback',
        warning: 'Agent coordination system encountered an error, using fallback',
        timestamp: new Date().toISOString()
      });
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      res.status(500).json({
        error: 'Internal server error',
        message: 'All systems encountered errors',
        timestamp: new Date().toISOString()
      });
    }
  }
});

app.get('/api/v1/faq/search', async (req, res) => {
  try {
    const { q: query, category, limit = 5 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const results = await faqService.search(query, {
      maxResults: parseInt(limit),
      category: category || null,
      minSimilarity: 0.1
    });

    res.json({
      query,
      results,
      total: results.length,
      category: category || 'all',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('FAQ search error:', error);
    res.status(500).json({ 
      error: 'FAQ search failed', 
      message: error.message 
    });
  }
});

app.get('/api/v1/faq/categories', (req, res) => {
  try {
    const categories = faqService.getCategories();
    res.json({
      categories,
      total: categories.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('FAQ categories error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve categories', 
      message: error.message 
    });
  }
});

// New agent coordination endpoints
app.get('/api/v1/agents/registry', (req, res) => {
  try {
    const agents = ragLayer.agentSystem?.registry ? 
      Object.values(ragLayer.agentSystem.registry).map(agent => ({
        id: Object.keys(ragLayer.agentSystem.registry).find(key => ragLayer.agentSystem.registry[key] === agent),
        name: agent.name,
        type: agent.type,
        scope: agent.scope,
        expertise: agent.expertise,
        capabilities: agent.capabilities,
        priority: agent.priority,
        status: agent.status
      })) : [];
    
    res.json({
      agents,
      total: agents.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Agent registry error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve agent registry', 
      message: error.message 
    });
  }
});

app.post('/api/v1/agents/route', async (req, res) => {
  try {
    const { query, sessionId, context = {} } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const routingResult = ragLayer.agentSystem?.router ? 
      ragLayer.agentSystem.router.routeQuery(query, sessionId, context) : 
      null;
    
    if (!routingResult) {
      return res.status(503).json({ 
        error: 'Agent routing system not available' 
      });
    }

    res.json({
      ...routingResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Agent routing error:', error);
    res.status(500).json({ 
      error: 'Agent routing failed', 
      message: error.message 
    });
  }
});

app.get('/api/v1/context/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!ragLayer.agentSystem?.contextManager) {
      return res.status(503).json({ 
        error: 'Context manager not available' 
      });
    }

    const session = ragLayer.agentSystem.contextManager.getSession(sessionId);
    const conversationSummary = ragLayer.agentSystem.contextManager.getConversationSummary(sessionId, 10);
    
    if (!session) {
      return res.status(404).json({ 
        error: 'Session not found' 
      });
    }

    res.json({
      session: {
        id: session.id,
        userId: session.userId,
        createdAt: session.createdAt,
        lastAccessAt: session.lastAccessAt,
        conversationTurns: session.conversationTurns,
        currentAgent: session.currentAgent,
        agentSwitchCount: session.agentSwitchCount
      },
      conversationSummary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Context retrieval error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve context', 
      message: error.message 
    });
  }
});

app.get('/api/v1/system/stats', (req, res) => {
  try {
    const faqStats = faqService.getStats();
    const vectorStats = vectorStore.getStats();
    
    // Get agent system stats
    let agentStats = {};
    try {
      if (ragLayer.agentSystem) {
        agentStats = {
          router: ragLayer.agentSystem.router ? ragLayer.agentSystem.router.getRoutingStats() : null,
          contextManager: ragLayer.agentSystem.contextManager ? ragLayer.agentSystem.contextManager.getStats() : null,
          orchestrator: ragLayer.agentSystem.orchestrator ? ragLayer.agentSystem.orchestrator.getStats() : null,
          responseCoordinator: ragLayer.agentSystem.responseCoordinator ? ragLayer.agentSystem.responseCoordinator.getStats() : null
        };
      }
    } catch (agentStatsError) {
      console.warn('Failed to get agent stats:', agentStatsError.message);
      agentStats = { error: 'Agent stats unavailable' };
    }
    
    res.json({
      faq: faqStats,
      vectorStore: vectorStats,
      rag: {
        initialized: ragLayer.initialized,
        confidenceThreshold: ragLayer.confidenceThreshold,
        maxResults: ragLayer.maxFAQResults
      },
      agents: agentStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve stats', 
      message: error.message 
    });
  }
});

// Graceful shutdown handling for Railway
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

// Start server with Railway-compatible configuration
const server = app.listen(port, host, () => {
  console.log('🚀 GovWin IQ Chatbot Server Started');
  console.log(`📍 Environment: ${env}`);
  console.log(`🌐 Server running at: http://${host}:${port}`);
  console.log(`🏥 Health check: http://${host}:${port}/api/v1/system/health`);
  console.log(`📊 System stats: http://${host}:${port}/api/v1/system/stats`);
  console.log(`🤖 Agent registry: http://${host}:${port}/api/v1/agents/registry`);
  
  if (isRailway) {
    console.log('🚄 Railway deployment detected');
    console.log(`🔗 Railway URL: ${process.env.RAILWAY_STATIC_URL || 'Not available'}`);
    console.log(`🌍 Public domain: ${process.env.RAILWAY_PUBLIC_DOMAIN || 'Not available'}`);
  }
  
  console.log('✅ Server ready for connections');
});

// Set server timeouts for Railway
server.keepAliveTimeout = parseInt(process.env.KEEP_ALIVE_TIMEOUT) || 65000;
server.headersTimeout = parseInt(process.env.HEADERS_TIMEOUT) || 66000;

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${port} is already in use`);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});

// Log unhandled rejections and exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  // Give Railway time to capture logs before exiting
  setTimeout(() => process.exit(1), 1000);
});
