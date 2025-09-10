const FAQService = require('../rag/faq-service.js');
const VectorStore = require('../rag/vector-store.js');

class RAGTester {
  constructor() {
    this.faqService = new FAQService();
    this.vectorStore = new VectorStore({
      persistencePath: './test/test-vectors.json',
      dimension: 200,
      autoSave: false,
      loadOnInit: false
    });
    this.testResults = [];
    this.confidenceThreshold = 0.25;
  }

  async initialize() {
    console.log('🧪 Initializing RAG Test Suite...');
    
    await this.faqService.initialize();
    console.log(`📚 FAQ Service loaded: ${this.faqService.faqData.length} items`);
    
    await this.populateVectorStore();
    console.log(`🔧 Vector store populated: ${this.vectorStore.getStats().count} vectors`);
    
    console.log('✅ RAG Test Suite initialized\n');
  }

  async populateVectorStore() {
    const batchItems = [];
    
    for (const item of this.faqService.faqData) {
      const embedding = this.faqService.generateTFIDFVector(item.combinedText);
      batchItems.push({
        id: item.id,
        vector: embedding,
        metadata: {
          title: item.title,
          content: item.content,
          category: item.category,
          keywords: item.keywords
        }
      });
    }
    
    this.vectorStore.addBatch(batchItems);
  }

  async runTest(testName, query, expectedCategory = null, expectedMinConfidence = null) {
    console.log(`\n🔍 Testing: "${query}"`);
    console.log(`   Expected category: ${expectedCategory || 'any'}`);
    console.log(`   Expected min confidence: ${expectedMinConfidence || 'any'}`);
    
    const startTime = Date.now();
    
    try {
      // Test FAQ Service search
      const faqResults = await this.faqService.search(query, { maxResults: 3 });
      
      // Test Vector Store search
      const queryEmbedding = this.faqService.generateTFIDFVector(query);
      const vectorResults = this.vectorStore.search(queryEmbedding, {
        k: 3,
        threshold: 0.05,
        includeMetadata: true,
        metric: 'cosine'
      });
      
      const searchTime = Date.now() - startTime;
      
      // Analyze results
      const bestFAQ = faqResults[0];
      const bestVector = vectorResults[0];
      
      const testResult = {
        testName,
        query,
        searchTime,
        faq: {
          results: faqResults.length,
          bestMatch: bestFAQ ? {
            title: bestFAQ.title,
            category: bestFAQ.category,
            confidence: bestFAQ.similarity,
            snippet: bestFAQ.snippet.substring(0, 100) + '...'
          } : null
        },
        vector: {
          results: vectorResults.length,
          bestMatch: bestVector ? {
            title: bestVector.metadata.title,
            category: bestVector.metadata.category,
            confidence: bestVector.score,
            id: bestVector.id
          } : null
        },
        evaluation: {
          categoryMatch: expectedCategory ? 
            (bestFAQ && bestFAQ.category === expectedCategory) || 
            (bestVector && bestVector.metadata.category === expectedCategory) : null,
          confidenceThreshold: expectedMinConfidence ? 
            (bestFAQ && bestFAQ.similarity >= expectedMinConfidence) ||
            (bestVector && bestVector.score >= expectedMinConfidence) : null,
          ragDecision: Math.max(
            bestFAQ ? bestFAQ.similarity : 0,
            bestVector ? bestVector.score : 0
          ) >= this.confidenceThreshold ? 'FAQ' : 'SearchFlow'
        }
      };
      
      // Log results
      console.log(`   📊 Results:`);
      console.log(`      FAQ: ${testResult.faq.results} matches`);
      console.log(`      Vector: ${testResult.vector.results} matches`);
      console.log(`      Best confidence: ${Math.max(
        testResult.faq.bestMatch?.confidence || 0,
        testResult.vector.bestMatch?.confidence || 0
      ).toFixed(3)}`);
      console.log(`      Category: ${testResult.faq.bestMatch?.category || testResult.vector.bestMatch?.category || 'none'}`);
      console.log(`      Decision: ${testResult.evaluation.ragDecision}`);
      console.log(`      Search time: ${searchTime}ms`);
      
      // Validation
      let passed = true;
      const issues = [];
      
      if (expectedCategory && !testResult.evaluation.categoryMatch) {
        passed = false;
        issues.push(`Expected category '${expectedCategory}' not matched`);
      }
      
      if (expectedMinConfidence && !testResult.evaluation.confidenceThreshold) {
        passed = false;
        issues.push(`Expected min confidence ${expectedMinConfidence} not met`);
      }
      
      testResult.passed = passed;
      testResult.issues = issues;
      
      console.log(`   ✅ Status: ${passed ? 'PASS' : 'FAIL'}`);
      if (!passed) {
        console.log(`   ❌ Issues: ${issues.join(', ')}`);
      }
      
      this.testResults.push(testResult);
      
    } catch (error) {
      console.error(`   ❌ Test failed with error: ${error.message}`);
      this.testResults.push({
        testName,
        query,
        error: error.message,
        passed: false
      });
    }
  }

  async runComprehensiveTests() {
    console.log('🚀 Starting Comprehensive RAG Tests\n');
    
    // High-confidence exact matches
    await this.runTest(
      'Exact Search Method Match',
      'IntelliSearch vs Advanced Search',
      'Search Methodology (Core Competency)',
      0.3
    );
    
    await this.runTest(
      'Keywords Filter Query',
      'How to use keywords and boolean logic',
      'Search Methodology (Core Competency)',
      0.2
    );
    
    // Medium-confidence semantic matches
    await this.runTest(
      'Search Help Query',
      'How do I find government opportunities?',
      null, // Any category
      0.15
    );
    
    await this.runTest(
      'Save Search Query',
      'How to set up email alerts for new opportunities',
      'Lead Management Workflow',
      0.2
    );
    
    // Category-specific tests
    await this.runTest(
      'Collaboration Feature',
      'How to share opportunities with team members',
      'Collaboration Features',
      0.15
    );
    
    await this.runTest(
      'Profile Setup',
      'Do I need to set up a profile',
      'Profile Features (Optional Efficiency Tools)',
      0.2
    );
    
    // Low-confidence edge cases
    await this.runTest(
      'Vague Query',
      'Help me with GovWin',
      null,
      null
    );
    
    await this.runTest(
      'Support Query',
      'I need help and training',
      'Support Integration',
      0.15
    );
    
    // Negative tests
    await this.runTest(
      'Completely Unrelated',
      'How to cook pasta',
      null,
      null
    );
    
    await this.runTest(
      'Technical Jargon',
      'Database connection timeout error',
      null,
      null
    );
  }

  async testSimilarityScoring() {
    console.log('\n🔬 Testing Similarity Scoring Accuracy\n');
    
    const testCases = [
      {
        query: 'IntelliSearch',
        expectedTopResults: [
          'Search Methodology (Core Competency): Two Search Types',
          'Common User Scenarios \\& Solutions: New User Priority Path'
        ]
      },
      {
        query: 'save search alerts',
        expectedTopResults: [
          'Lead Management Workflow: Saving Searches (Automation)',
          'Lead Management Workflow: My Inbox (Central Hub)'
        ]
      },
      {
        query: 'share opportunities',
        expectedTopResults: [
          'Collaboration Features: Sharing Content',
          'Collaboration Features: Search Collaboration'
        ]
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`🎯 Similarity test: "${testCase.query}"`);
      
      const results = await this.faqService.search(testCase.query, { maxResults: 5 });
      
      console.log('   Top results:');
      results.forEach((result, index) => {
        const isExpected = testCase.expectedTopResults.some(expected => 
          result.title.includes(expected.replace(/\\\\/g, '\\'))
        );
        const marker = isExpected ? '✅' : '⚪';
        console.log(`      ${index + 1}. ${marker} ${result.title} (${(result.similarity * 100).toFixed(1)}%)`);
      });
      
      const topTwoMatch = results.slice(0, 2).some(result =>
        testCase.expectedTopResults.some(expected => 
          result.title.includes(expected.replace(/\\\\/g, '\\'))
        )
      );
      
      console.log(`   📊 Expected results in top 2: ${topTwoMatch ? 'YES' : 'NO'}\n`);
    }
  }

  async testPerformanceBenchmark() {
    console.log('⚡ Performance Benchmark Tests\n');
    
    const queries = [
      'search opportunities',
      'IntelliSearch vs Advanced Search',
      'save searches and alerts',
      'share with team members',
      'how to use filters'
    ];
    
    const iterations = 10;
    const times = [];
    
    console.log(`🏃‍♂️ Running ${iterations} iterations of ${queries.length} queries...`);
    
    for (let i = 0; i < iterations; i++) {
      for (const query of queries) {
        const startTime = Date.now();
        
        await this.faqService.search(query);
        const queryEmbedding = this.faqService.generateTFIDFVector(query);
        this.vectorStore.search(queryEmbedding, { k: 3 });
        
        times.push(Date.now() - startTime);
      }
    }
    
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    console.log(`📈 Performance Results:`);
    console.log(`   Average time: ${avgTime.toFixed(2)}ms`);
    console.log(`   Min time: ${minTime}ms`);
    console.log(`   Max time: ${maxTime}ms`);
    console.log(`   Total queries: ${times.length}`);
    console.log(`   Queries/second: ${(1000 / avgTime).toFixed(1)}`);
  }

  async testVectorStoreOperations() {
    console.log('\n🔧 Testing Vector Store Operations\n');
    
    // Test basic operations
    console.log('🧪 Testing CRUD operations...');
    
    const testVector = new Array(200).fill(0.1);
    const testId = 'test-vector-1';
    
    // Add
    this.vectorStore.add(testId, testVector, { title: 'Test Vector', category: 'Test' });
    console.log(`   ✅ Add: Vector added with ID ${testId}`);
    
    // Get
    const retrieved = this.vectorStore.get(testId);
    console.log(`   ✅ Get: Retrieved vector with title '${retrieved?.metadata.title}'`);
    
    // Update
    this.vectorStore.update(testId, null, { title: 'Updated Test Vector' });
    const updated = this.vectorStore.get(testId);
    console.log(`   ✅ Update: Title updated to '${updated?.metadata.title}'`);
    
    // Search
    const searchResults = this.vectorStore.search(testVector, { k: 1 });
    console.log(`   ✅ Search: Found ${searchResults.length} similar vectors`);
    
    // Delete
    const deleted = this.vectorStore.delete(testId);
    console.log(`   ✅ Delete: Vector removed (${deleted ? 'success' : 'failed'})`);
    
    // Test category operations
    console.log('\n🏷️ Testing category operations...');
    const categories = this.vectorStore.getCategories();
    console.log(`   📊 Found ${categories.length} categories: ${categories.slice(0, 3).join(', ')}...`);
    
    const categoryResults = this.vectorStore.getByCategory(categories[0]);
    console.log(`   🔍 Category '${categories[0]}' has ${categoryResults.length} vectors`);
    
    // Test clustering
    if (this.vectorStore.getStats().count >= 5) {
      console.log('\n🕸️ Testing clustering...');
      const clusters = this.vectorStore.cluster({ numClusters: 3 });
      console.log(`   📊 Created ${clusters.length} clusters:`);
      clusters.forEach((cluster, i) => {
        console.log(`      Cluster ${i + 1}: ${cluster.size} vectors, top category: ${cluster.categories[0]?.category || 'none'}`);
      });
    }
  }

  generateTestReport() {
    console.log('\n📋 TEST REPORT SUMMARY\n');
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(t => t.passed).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`📊 Overall Results:`);
    console.log(`   Total tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
    console.log(`   Failed: ${failedTests} (${((failedTests / totalTests) * 100).toFixed(1)}%)`);
    
    if (failedTests > 0) {
      console.log(`\n❌ Failed Tests:`);
      this.testResults
        .filter(t => !t.passed)
        .forEach(test => {
          console.log(`   - ${test.testName}: ${test.issues?.join(', ') || test.error || 'Unknown error'}`);
        });
    }
    
    // Performance summary
    const avgSearchTime = this.testResults
      .filter(t => t.searchTime)
      .reduce((sum, t) => sum + t.searchTime, 0) / 
      this.testResults.filter(t => t.searchTime).length;
    
    console.log(`\n⚡ Performance Summary:`);
    console.log(`   Average search time: ${avgSearchTime.toFixed(2)}ms`);
    
    // RAG decision analysis
    const ragDecisions = this.testResults
      .filter(t => t.evaluation?.ragDecision)
      .reduce((acc, t) => {
        acc[t.evaluation.ragDecision] = (acc[t.evaluation.ragDecision] || 0) + 1;
        return acc;
      }, {});
    
    console.log(`   RAG decisions: FAQ: ${ragDecisions.FAQ || 0}, SearchFlow: ${ragDecisions.SearchFlow || 0}`);
    
    // System stats
    const faqStats = this.faqService.getStats();
    const vectorStats = this.vectorStore.getStats();
    
    console.log(`\n🔧 System Stats:`);
    console.log(`   FAQ items: ${faqStats.totalItems}`);
    console.log(`   Categories: ${faqStats.categories}`);
    console.log(`   Vocabulary size: ${faqStats.vocabularySize}`);
    console.log(`   Vector count: ${vectorStats.count}`);
    console.log(`   Memory usage: ${Math.round(vectorStats.memoryUsage.total / 1024)}KB`);
    
    return {
      totalTests,
      passedTests,
      failedTests,
      passRate: (passedTests / totalTests) * 100,
      avgSearchTime,
      ragDecisions,
      systemStats: { faq: faqStats, vector: vectorStats }
    };
  }

  async runAllTests() {
    try {
      await this.initialize();
      await this.runComprehensiveTests();
      await this.testSimilarityScoring();
      await this.testPerformanceBenchmark();
      await this.testVectorStoreOperations();
      
      const report = this.generateTestReport();
      
      console.log('\n🎉 All tests completed!');
      return report;
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      throw error;
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new RAGTester();
  tester.runAllTests()
    .then(report => {
      console.log('\n✅ Test suite completed successfully');
      process.exit(report.failedTests > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = RAGTester;