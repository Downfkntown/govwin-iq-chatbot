const fs = require('fs');
const path = require('path');

class FAQService {
  constructor() {
    this.faqData = [];
    this.embeddings = new Map();
    this.vocabulary = new Map();
    this.idfScores = new Map();
    this.isInitialized = false;
    this.vectorDimension = 200;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await this.loadKnowledgeBase();
      this.buildVocabulary();
      this.calculateIDF();
      this.generateEmbeddings();
      this.isInitialized = true;
      console.log('Lightweight FAQ Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize FAQ Service:', error);
      throw error;
    }
  }

  async loadKnowledgeBase() {
    const knowledgeBasePath = path.join(__dirname, '..', 'knowledge-base', 'govwin-iq-knowledge-base.md');
    
    if (!fs.existsSync(knowledgeBasePath)) {
      throw new Error('Knowledge base file not found');
    }

    const content = fs.readFileSync(knowledgeBasePath, 'utf8');
    this.parseKnowledgeBase(content);
  }

  parseKnowledgeBase(content) {
    const sections = content.split(/(?=^##\s)/gm).filter(section => section.trim());
    
    sections.forEach((section, index) => {
      const lines = section.split('\n');
      const title = lines[0].replace(/^#+\s*/, '').trim();
      
      if (!title) return;

      const subsections = this.extractSubsections(section);
      
      if (subsections.length > 0) {
        subsections.forEach(subsection => {
          this.faqData.push({
            id: `${index}-${subsection.id}`,
            title: `${title} - ${subsection.title}`,
            content: subsection.content,
            category: title,
            combinedText: `${title} ${subsection.title} ${subsection.content}`,
            keywords: this.extractKeywords(subsection.content)
          });
        });
      } else {
        const content = lines.slice(1).join('\n').trim();
        if (content) {
          this.faqData.push({
            id: index.toString(),
            title,
            content,
            category: 'General',
            combinedText: `${title} ${content}`,
            keywords: this.extractKeywords(content)
          });
        }
      }
    });
  }

  extractSubsections(section) {
    const subsectionRegex = /^###\s+(.+?)$([\s\S]*?)(?=^###|\n\n|$)/gm;
    const subsections = [];
    let match;
    
    while ((match = subsectionRegex.exec(section)) !== null) {
      const title = match[1].trim();
      const content = match[2].trim();
      
      if (title && content) {
        subsections.push({
          id: subsections.length.toString(),
          title,
          content
        });
      }
    }
    
    return subsections;
  }

  extractKeywords(text) {
    const cleanText = text
      .replace(/[#*`\[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .toLowerCase();

    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 
      'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'this', 'that', 
      'these', 'those', 'can', 'may', 'might', 'must', 'shall', 'from', 'up', 
      'out', 'down', 'off', 'over', 'under', 'again', 'further', 'then', 'once'
    ]);

    return cleanText
      .split(/\W+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .filter((word, index, arr) => arr.indexOf(word) === index)
      .slice(0, 30);
  }

  buildVocabulary() {
    const wordCounts = new Map();
    
    this.faqData.forEach(item => {
      const words = this.extractKeywords(item.combinedText);
      words.forEach(word => {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      });
    });

    const sortedWords = Array.from(wordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.vectorDimension);

    sortedWords.forEach(([word, count], index) => {
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
      
      const idf = Math.log(docCount / (docFreq + 1));
      this.idfScores.set(word, idf);
    }
  }

  generateTFIDFVector(text) {
    const vector = new Array(this.vectorDimension).fill(0);
    const words = this.extractKeywords(text);
    const termFreq = new Map();
    
    words.forEach(word => {
      termFreq.set(word, (termFreq.get(word) || 0) + 1);
    });

    for (const [word, freq] of termFreq) {
      const vocabIndex = this.vocabulary.get(word);
      if (vocabIndex !== undefined) {
        const tf = freq / words.length;
        const idf = this.idfScores.get(word) || 0;
        vector[vocabIndex] = tf * idf;
      }
    }

    return this.normalizeVector(vector);
  }

  normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
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
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
    }
    
    return Math.max(0, Math.min(1, dotProduct));
  }

  async search(query, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const {
      maxResults = 5,
      minSimilarity = 0.1,
      category = null,
      includeKeywordBoost = true
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
        similarity = similarity * 0.7 + keywordBoost * 0.3;
      }

      if (similarity >= minSimilarity) {
        results.push({
          ...item,
          similarity,
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
    const itemWords = new Set(item.keywords);
    
    let matches = 0;
    queryWords.forEach(word => {
      if (itemWords.has(word)) {
        matches++;
      }
    });

    return queryWords.length > 0 ? matches / queryWords.length : 0;
  }

  generateSnippet(content, query, maxLength = 200) {
    const queryWords = this.extractKeywords(query.toLowerCase());
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    let bestSentence = sentences[0] || content.substring(0, maxLength);
    let bestScore = 0;

    sentences.forEach(sentence => {
      const sentenceWords = this.extractKeywords(sentence.toLowerCase());
      let score = 0;
      
      queryWords.forEach(word => {
        if (sentenceWords.includes(word)) {
          score++;
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
      
      if (similarity > 0.1) {
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
        keywords: item.keywords
      }));
  }

  getById(id) {
    if (!this.isInitialized) {
      return null;
    }
    
    return this.faqData.find(item => item.id === id) || null;
  }

  searchByCategory(query, category) {
    return this.search(query, { category, maxResults: 10 });
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

  getStats() {
    return {
      totalItems: this.faqData.length,
      categories: this.getCategories().length,
      vocabularySize: this.vocabulary.size,
      vectorDimension: this.vectorDimension,
      isInitialized: this.isInitialized,
      hasEmbeddings: this.embeddings.size > 0,
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
      vectorDimension: this.vectorDimension,
      timestamp: Date.now()
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
  }
}

module.exports = FAQService;