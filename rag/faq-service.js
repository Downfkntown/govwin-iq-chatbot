const fs = require('fs');
const path = require('path');

class FAQService {
  constructor(options = {}) {
    this.faqData = [];
    this.embeddings = new Map();
    this.vocabulary = new Map();
    this.idfScores = new Map();
    this.isInitialized = false;
    this.vectorDimension = options.vectorDimension || 200;
    this.maxKeywords = options.maxKeywords || 30;
    this.stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 
      'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'this', 'that', 
      'these', 'those', 'can', 'may', 'might', 'must', 'shall', 'from', 'up', 
      'out', 'down', 'off', 'over', 'under', 'again', 'further', 'then', 'once',
      'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each',
      'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
      'own', 'same', 'so', 'than', 'too', 'very', 'just', 'now'
    ]);
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      console.log('Initializing FAQ Service...');
      await this.loadKnowledgeBase();
      this.buildVocabulary();
      this.calculateIDF();
      this.generateEmbeddings();
      this.isInitialized = true;
      console.log('FAQ Service initialized successfully');
      console.log(`Loaded ${this.faqData.length} FAQ items in ${this.getCategories().length} categories`);
    } catch (error) {
      console.error('Failed to initialize FAQ Service:', error);
      throw error;
    }
  }

  async loadKnowledgeBase() {
    const knowledgeBasePath = path.join(__dirname, '..', 'knowledge-base', 'govwin-iq-knowledge-base.md');
    
    if (!fs.existsSync(knowledgeBasePath)) {
      throw new Error(`Knowledge base file not found at: ${knowledgeBasePath}`);
    }

    const content = fs.readFileSync(knowledgeBasePath, 'utf8');
    this.parseKnowledgeBase(content);
    console.log(`Parsed ${this.faqData.length} FAQ items from knowledge base`);
  }

  parseKnowledgeBase(content) {
    const sections = content.split(/(?=^##\s)/gm).filter(section => section.trim());
    
    sections.forEach((section, sectionIndex) => {
      const lines = section.split('\n');
      const sectionTitle = lines[0].replace(/^#+\s*/, '').trim();
      
      if (!sectionTitle || sectionTitle.toLowerCase().includes('chatbot')) return;

      const subsections = this.extractSubsections(section);
      
      if (subsections.length > 0) {
        subsections.forEach((subsection, subIndex) => {
          this.faqData.push({
            id: `${sectionIndex}-${subIndex}`,
            title: `${sectionTitle}: ${subsection.title}`,
            content: subsection.content,
            category: sectionTitle,
            combinedText: `${sectionTitle} ${subsection.title} ${subsection.content}`,
            keywords: this.extractKeywords(`${subsection.title} ${subsection.content}`),
            section: sectionTitle,
            subsection: subsection.title
          });
        });
      } else {
        const sectionContent = lines.slice(1).join('\n').trim();
        if (sectionContent && sectionContent.length > 50) {
          this.faqData.push({
            id: `${sectionIndex}`,
            title: sectionTitle,
            content: sectionContent,
            category: 'General',
            combinedText: `${sectionTitle} ${sectionContent}`,
            keywords: this.extractKeywords(`${sectionTitle} ${sectionContent}`),
            section: sectionTitle,
            subsection: null
          });
        }
      }
    });
  }

  extractSubsections(section) {
    const subsections = [];
    const lines = section.split('\n');
    let currentTitle = null;
    let currentContent = [];
    
    for (const line of lines) {
      if (line.match(/^###\s+/)) {
        if (currentTitle && currentContent.length > 0) {
          subsections.push({
            title: currentTitle,
            content: currentContent.join('\n').trim()
          });
        }
        currentTitle = line.replace(/^###\s*/, '').trim();
        currentContent = [];
      } else if (currentTitle && line.trim()) {
        currentContent.push(line);
      }
    }
    
    if (currentTitle && currentContent.length > 0) {
      subsections.push({
        title: currentTitle,
        content: currentContent.join('\n').trim()
      });
    }
    
    return subsections.filter(sub => sub.content.length > 30);
  }

  extractKeywords(text) {
    const cleanText = text
      .replace(/[#*`\[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ');

    const words = cleanText
      .split(/\s+/)
      .filter(word => word.length > 2 && !this.stopWords.has(word))
      .filter(word => !/^\d+$/.test(word));

    const wordCounts = new Map();
    words.forEach(word => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    });

    return Array.from(wordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.maxKeywords)
      .map(([word]) => word);
  }

  buildVocabulary() {
    const globalWordCounts = new Map();
    
    this.faqData.forEach(item => {
      const words = this.extractKeywords(item.combinedText);
      words.forEach(word => {
        globalWordCounts.set(word, (globalWordCounts.get(word) || 0) + 1);
      });
    });

    const sortedWords = Array.from(globalWordCounts.entries())
      .filter(([word, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.vectorDimension);

    sortedWords.forEach(([word], index) => {
      this.vocabulary.set(word, index);
    });

    console.log(`Built vocabulary with ${this.vocabulary.size} terms`);
  }

  calculateIDF() {
    const docCount = this.faqData.length;
    
    for (const [word] of this.vocabulary) {
      let docFreq = 0;
      
      this.faqData.forEach(item => {
        if (item.keywords.includes(word)) {
          docFreq++;
        }
      });
      
      const idf = Math.log((docCount + 1) / (docFreq + 1)) + 1;
      this.idfScores.set(word, idf);
    }

    console.log(`Calculated IDF scores for ${this.idfScores.size} terms`);
  }

  generateTFIDFVector(text) {
    const vector = new Array(this.vectorDimension).fill(0);
    const words = this.extractKeywords(text);
    const termFreq = new Map();
    
    words.forEach(word => {
      termFreq.set(word, (termFreq.get(word) || 0) + 1);
    });

    const totalTerms = words.length;
    if (totalTerms === 0) return vector;

    for (const [word, freq] of termFreq) {
      const vocabIndex = this.vocabulary.get(word);
      if (vocabIndex !== undefined) {
        const tf = freq / totalTerms;
        const idf = this.idfScores.get(word) || 1;
        vector[vocabIndex] = tf * idf;
      }
    }

    return this.normalizeVector(vector);
  }

  normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude === 0) return vector;
    return vector.map(val => val / magnitude);
  }

  generateEmbeddings() {
    this.faqData.forEach(item => {
      const embedding = this.generateTFIDFVector(item.combinedText);
      this.embeddings.set(item.id, embedding);
    });
    
    console.log(`Generated ${this.embeddings.size} TF-IDF embeddings`);
  }

  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      magnitudeA += vecA[i] * vecA[i];
      magnitudeB += vecB[i] * vecB[i];
    }
    
    const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
    return magnitude > 0 ? Math.max(0, Math.min(1, dotProduct / magnitude)) : 0;
  }

  async search(query, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const {
      maxResults = 5,
      minSimilarity = 0.1,
      category = null,
      includeKeywordBoost = true,
      boostWeight = 0.3
    } = options;

    if (!query || query.trim().length === 0) {
      return [];
    }

    const queryEmbedding = this.generateTFIDFVector(query);
    const results = [];

    for (const item of this.faqData) {
      if (category && item.category !== category) {
        continue;
      }

      const itemEmbedding = this.embeddings.get(item.id);
      if (!itemEmbedding) continue;

      let similarity = this.cosineSimilarity(queryEmbedding, itemEmbedding);

      if (includeKeywordBoost) {
        const keywordBoost = this.calculateKeywordBoost(query, item);
        similarity = similarity * (1 - boostWeight) + keywordBoost * boostWeight;
      }

      if (similarity >= minSimilarity) {
        results.push({
          id: item.id,
          title: item.title,
          content: item.content,
          category: item.category,
          section: item.section,
          subsection: item.subsection,
          similarity,
          keywords: item.keywords.slice(0, 5),
          snippet: this.generateSnippet(item.content, query)
        });
      }
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxResults);
  }

  calculateKeywordBoost(query, item) {
    const queryWords = this.extractKeywords(query.toLowerCase());
    const itemWords = new Set(item.keywords.concat(
      item.title.toLowerCase().split(/\W+/).filter(w => w.length > 2)
    ));
    
    let matches = 0;
    let totalWeight = 0;

    queryWords.forEach(word => {
      totalWeight++;
      if (itemWords.has(word)) {
        matches++;
      }
    });

    return totalWeight > 0 ? matches / totalWeight : 0;
  }

  generateSnippet(content, query, maxLength = 200) {
    const queryWords = this.extractKeywords(query.toLowerCase());
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    if (sentences.length === 0) {
      const snippet = content.trim();
      return snippet.length > maxLength ? 
        snippet.substring(0, maxLength - 3) + '...' : 
        snippet;
    }

    let bestSentence = sentences[0];
    let bestScore = 0;

    sentences.forEach(sentence => {
      const sentenceWords = this.extractKeywords(sentence.toLowerCase());
      let score = 0;
      
      queryWords.forEach(word => {
        if (sentenceWords.includes(word)) {
          score += 2;
        }
        if (sentence.toLowerCase().includes(word)) {
          score += 1;
        }
      });

      if (score > bestScore) {
        bestScore = score;
        bestSentence = sentence;
      }
    });

    const snippet = bestSentence.trim();
    return snippet.length > maxLength ? 
      snippet.substring(0, maxLength - 3) + '...' : 
      snippet;
  }

  findSimilarQuestions(id, maxResults = 3) {
    if (!this.isInitialized) {
      return [];
    }

    const item = this.faqData.find(faq => faq.id === id);
    if (!item) return [];

    const itemEmbedding = this.embeddings.get(id);
    if (!itemEmbedding) return [];

    const results = [];

    for (const otherItem of this.faqData) {
      if (otherItem.id === id) continue;

      const otherEmbedding = this.embeddings.get(otherItem.id);
      if (!otherEmbedding) continue;

      const similarity = this.cosineSimilarity(itemEmbedding, otherEmbedding);
      
      if (similarity > 0.15) {
        results.push({
          id: otherItem.id,
          title: otherItem.title,
          category: otherItem.category,
          similarity
        });
      }
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxResults);
  }

  searchByCategory(query, category) {
    return this.search(query, { 
      category, 
      maxResults: 10, 
      minSimilarity: 0.05 
    });
  }

  getCategories() {
    if (!this.isInitialized) {
      return [];
    }
    
    const categories = new Set(this.faqData.map(item => item.category));
    return Array.from(categories).sort();
  }

  getByCategory(category) {
    if (!this.isInitialized) {
      return [];
    }
    
    return this.faqData
      .filter(item => item.category === category)
      .map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        keywords: item.keywords.slice(0, 5)
      }));
  }

  getById(id) {
    if (!this.isInitialized) {
      return null;
    }
    
    const item = this.faqData.find(item => item.id === id);
    if (!item) return null;

    return {
      ...item,
      similarQuestions: this.findSimilarQuestions(id, 3)
    };
  }

  getTopKeywords(limit = 20) {
    if (!this.isInitialized) {
      return [];
    }

    const keywordCounts = new Map();
    
    this.faqData.forEach(item => {
      item.keywords.forEach(keyword => {
        keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
      });
    });

    return Array.from(keywordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([keyword, count]) => ({ keyword, count }));
  }

  analyzeQuery(query) {
    if (!this.isInitialized) {
      return { keywords: [], categories: [], complexity: 'unknown' };
    }

    const keywords = this.extractKeywords(query);
    const categories = new Set();
    
    this.faqData.forEach(item => {
      const overlap = keywords.filter(kw => item.keywords.includes(kw)).length;
      if (overlap > 0) {
        categories.add(item.category);
      }
    });

    const complexity = keywords.length < 3 ? 'simple' : 
                      keywords.length < 6 ? 'medium' : 'complex';

    return {
      keywords,
      categories: Array.from(categories),
      complexity,
      keywordCount: keywords.length
    };
  }

  getStats() {
    return {
      totalItems: this.faqData.length,
      categories: this.getCategories().length,
      vocabularySize: this.vocabulary.size,
      vectorDimension: this.vectorDimension,
      isInitialized: this.isInitialized,
      hasEmbeddings: this.embeddings.size > 0,
      averageKeywords: this.faqData.length > 0 ? 
        this.faqData.reduce((sum, item) => sum + item.keywords.length, 0) / this.faqData.length : 0,
      memoryUsage: {
        embeddings: this.embeddings.size * this.vectorDimension * 8,
        vocabulary: this.vocabulary.size * 50,
        faqData: JSON.stringify(this.faqData).length
      }
    };
  }

  exportData() {
    return {
      faqData: this.faqData,
      vocabulary: Array.from(this.vocabulary.entries()),
      embeddings: Array.from(this.embeddings.entries()),
      idfScores: Array.from(this.idfScores.entries()),
      vectorDimension: this.vectorDimension,
      timestamp: Date.now(),
      version: '2.0'
    };
  }

  async rebuildIndex() {
    console.log('Rebuilding FAQ index...');
    this.vocabulary.clear();
    this.embeddings.clear();
    this.idfScores.clear();
    
    this.buildVocabulary();
    this.calculateIDF();
    this.generateEmbeddings();
    
    console.log('FAQ index rebuilt successfully');
    return this.getStats();
  }
}

module.exports = FAQService;