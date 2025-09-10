const express = require('express');
const cors = require('cors');
const SearchAssistanceFlow = require('../conversation-flows/search-assistance.js');
const FAQService = require('../rag/faq-service.js');
const VectorStore = require('../rag/vector-store.js');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const searchFlow = new SearchAssistanceFlow();
const faqService = new FAQService();
const vectorStore = new VectorStore({
  persistencePath: './rag/govwin-faq-vectors.json',
  autoSave: true
});

class RAGLayer {
  constructor(faqService, vectorStore) {
    this.faqService = faqService;
    this.vectorStore = vectorStore;
    this.initialized = false;
    this.confidenceThreshold = 0.3;
    this.maxFAQResults = 3;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      console.log('Initializing RAG layer...');
      
      await this.faqService.initialize();
      console.log('FAQ Service initialized');
      
      const faqStats = this.faqService.getStats();
      console.log(`Loaded ${faqStats.totalItems} FAQ items in ${faqStats.categories} categories`);
      
      await this.populateVectorStore();
      console.log('Vector store populated');
      
      this.initialized = true;
      console.log('RAG layer initialized successfully');
    } catch (error) {
      console.error('Failed to initialize RAG layer:', error);
      throw error;
    }
  }

  async populateVectorStore() {
    const vectorStats = this.vectorStore.getStats();
    
    if (vectorStats.count > 0) {
      console.log(`Vector store already contains ${vectorStats.count} vectors`);
      return;
    }

    console.log('Populating vector store with FAQ embeddings...');
    
    for (const item of this.faqService.faqData) {
      try {
        const embedding = this.faqService.generateTFIDFVector(
          item.title + ' ' + item.content
        );
        
        this.vectorStore.add(item.id, embedding, {
          title: item.title,
          content: item.content,
          category: item.category,
          keywords: item.keywords
        });
      } catch (error) {
        console.error(`Failed to generate embedding for FAQ ${item.id}:`, error);
      }
    }

    this.vectorStore.save();
    console.log(`Added ${this.vectorStore.getStats().count} vectors to store`);
  }

  async findFAQMatches(query) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const queryEmbedding = this.faqService.generateTFIDFVector(query);
      
      const results = this.vectorStore.search(queryEmbedding, {
        k: this.maxFAQResults,
        threshold: 0.1,
        includeMetadata: true,
        metric: 'cosine'
      });

      return results.map(result => ({
        id: result.id,
        title: result.metadata.title,
        content: result.metadata.content,
        category: result.metadata.category,
        confidence: result.score,
        snippet: this.faqService.generateSnippet(result.metadata.content, query)
      }));
    } catch (error) {
      console.error('FAQ matching failed, falling back to FAQ service search:', error);
      return await this.faqService.search(query, { maxResults: this.maxFAQResults });
    }
  }

  async processQuery(query) {
    const faqMatches = await this.findFAQMatches(query);
    
    const highConfidenceMatches = faqMatches.filter(
      match => match.confidence >= this.confidenceThreshold
    );

    return {
      hasFAQMatch: highConfidenceMatches.length > 0,
      faqResults: faqMatches,
      bestMatch: highConfidenceMatches[0] || null,
      shouldUseFAQ: highConfidenceMatches.length > 0,
      confidence: highConfidenceMatches[0]?.confidence || 0
    };
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
      title: match.title,
      content: match.content,
      snippet: match.snippet,
      additionalResults: ragResult.faqResults.slice(1)
    };

    if (ragResult.faqResults.length > 1) {
      response.relatedQuestions = ragResult.faqResults.slice(1, 3).map(r => ({
        title: r.title,
        confidence: r.confidence
      }));
    }

    return response;
  }
}

const ragLayer = new RAGLayer(faqService, vectorStore);

ragLayer.initialize().catch(error => {
  console.error('RAG initialization failed:', error);
  console.log('Server will continue without RAG functionality');
});

app.get('/api/v1/system/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/v1/chat/message', async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Message is required and must be a string' 
      });
    }

    const ragResult = await ragLayer.processQuery(message);
    
    if (ragResult.shouldUseFAQ) {
      const faqResponse = ragLayer.formatFAQResponse(ragResult);
      
      if (faqResponse) {
        return res.json({
          ...faqResponse,
          source: 'faq',
          message: `Based on our knowledge base, here's what I found about "${message}":`,
          timestamp: new Date().toISOString(),
          debug: {
            confidence: ragResult.confidence,
            totalMatches: ragResult.faqResults.length
          }
        });
      }
    }

    const searchResponse = searchFlow.handleUserInput(message, context);
    
    res.json({
      ...searchResponse,
      source: 'search_flow',
      timestamp: new Date().toISOString(),
      debug: {
        ragChecked: true,
        faqMatches: ragResult.faqResults.length,
        fallbackReason: 'No high-confidence FAQ match found'
      }
    });

  } catch (error) {
    console.error('Error processing chat message:', error);
    
    try {
      const fallbackResponse = searchFlow.handleUserInput(req.body.message || '');
      res.json({
        ...fallbackResponse,
        source: 'search_flow_fallback',
        warning: 'RAG layer encountered an error, using fallback',
        timestamp: new Date().toISOString()
      });
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Both RAG and fallback systems encountered errors',
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

app.get('/api/v1/system/stats', (req, res) => {
  try {
    const faqStats = faqService.getStats();
    const vectorStats = vectorStore.getStats();
    
    res.json({
      faq: faqStats,
      vectorStore: vectorStats,
      rag: {
        initialized: ragLayer.initialized,
        confidenceThreshold: ragLayer.confidenceThreshold,
        maxResults: ragLayer.maxFAQResults
      },
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

app.listen(port, () => {
  console.log(`Simple server running on http://localhost:${port}`);
});
