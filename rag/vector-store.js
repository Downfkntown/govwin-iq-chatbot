const fs = require('fs');
const path = require('path');

class VectorStore {
  constructor(options = {}) {
    this.dimension = options.dimension || 200;
    this.persistencePath = options.persistencePath || path.join(__dirname, 'faq-vectors.json');
    this.autoSave = options.autoSave !== false;
    this.maxVectors = options.maxVectors || 1000;
    this.saveDelay = options.saveDelay || 2000;
    
    this.vectors = new Map();
    this.metadata = new Map();
    this.categoryIndex = new Map();
    this.keywordIndex = new Map();
    this.isDirty = false;
    this.lastSave = 0;
    this.saveTimeout = null;
    
    if (options.loadOnInit !== false) {
      this.load();
    }
  }

  add(id, vector, metadata = {}) {
    this.validateVector(vector);
    this.validateId(id);
    
    if (this.vectors.size >= this.maxVectors && !this.vectors.has(id)) {
      throw new Error(`Maximum vector limit (${this.maxVectors}) reached`);
    }
    
    const normalizedVector = this.normalizeVector([...vector]);
    const enrichedMetadata = {
      id,
      ...metadata,
      timestamp: Date.now(),
      dimension: this.dimension
    };
    
    this.vectors.set(id, normalizedVector);
    this.metadata.set(id, enrichedMetadata);
    
    this.updateIndexes(id, enrichedMetadata);
    this.markDirty();
    
    return id;
  }

  addBatch(items) {
    const results = [];
    const errors = [];
    
    items.forEach((item, index) => {
      try {
        const id = this.add(item.id || `batch_${index}`, item.vector, item.metadata);
        results.push({ id, success: true, index });
      } catch (error) {
        errors.push({ 
          id: item.id || `batch_${index}`, 
          error: error.message, 
          success: false,
          index 
        });
      }
    });
    
    return { 
      successful: results.length, 
      failed: errors.length, 
      total: items.length,
      results,
      errors 
    };
  }

  get(id) {
    const vector = this.vectors.get(id);
    const metadata = this.metadata.get(id);
    
    if (!vector || !metadata) {
      return null;
    }
    
    return { 
      id, 
      vector: [...vector], 
      metadata: { ...metadata } 
    };
  }

  getAll() {
    const results = [];
    for (const [id] of this.vectors) {
      results.push(this.get(id));
    }
    return results;
  }

  update(id, vector = null, metadata = null) {
    if (!this.exists(id)) {
      throw new Error(`Vector with id '${id}' not found`);
    }
    
    if (vector !== null) {
      this.validateVector(vector);
      const normalizedVector = this.normalizeVector([...vector]);
      this.vectors.set(id, normalizedVector);
    }
    
    if (metadata !== null) {
      const existingMetadata = this.metadata.get(id);
      const updatedMetadata = {
        ...existingMetadata,
        ...metadata,
        id,
        updatedAt: Date.now()
      };
      this.metadata.set(id, updatedMetadata);
      this.updateIndexes(id, updatedMetadata);
    }
    
    this.markDirty();
    return true;
  }

  delete(id) {
    const hasVector = this.vectors.has(id);
    const hasMetadata = this.metadata.has(id);
    
    if (hasVector || hasMetadata) {
      this.vectors.delete(id);
      this.metadata.delete(id);
      this.removeFromIndexes(id);
      this.markDirty();
      return true;
    }
    
    return false;
  }

  exists(id) {
    return this.vectors.has(id) && this.metadata.has(id);
  }

  validateVector(vector) {
    if (!Array.isArray(vector)) {
      throw new Error('Vector must be an array');
    }
    
    if (vector.length !== this.dimension) {
      throw new Error(`Vector dimension must be ${this.dimension}, got ${vector.length}`);
    }
    
    if (!vector.every(val => typeof val === 'number' && !isNaN(val) && isFinite(val))) {
      throw new Error('Vector must contain only valid finite numbers');
    }
    
    return true;
  }

  validateId(id) {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new Error('Vector ID must be a non-empty string');
    }
    return true;
  }

  normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude === 0 || !isFinite(magnitude)) {
      return new Array(vector.length).fill(0);
    }
    return vector.map(val => val / magnitude);
  }

  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
    }
    
    return Math.max(0, Math.min(1, dotProduct));
  }

  euclideanDistance(vecA, vecB) {
    if (vecA.length !== vecB.length) return Infinity;
    
    let sum = 0;
    for (let i = 0; i < vecA.length; i++) {
      const diff = vecA[i] - vecB[i];
      sum += diff * diff;
    }
    
    return Math.sqrt(sum);
  }

  manhattanDistance(vecA, vecB) {
    if (vecA.length !== vecB.length) return Infinity;
    
    let sum = 0;
    for (let i = 0; i < vecA.length; i++) {
      sum += Math.abs(vecA[i] - vecB[i]);
    }
    
    return sum;
  }

  search(queryVector, options = {}) {
    this.validateVector(queryVector);
    
    const {
      k = 5,
      threshold = 0.0,
      metric = 'cosine',
      includeMetadata = true,
      includeVectors = false,
      filter = null,
      category = null
    } = options;
    
    const normalizedQuery = this.normalizeVector([...queryVector]);
    const candidateIds = this.getCandidateIds(filter, category);
    const results = [];

    for (const id of candidateIds) {
      const vector = this.vectors.get(id);
      const metadata = this.metadata.get(id);
      
      if (!vector || !metadata) continue;

      let score = this.calculateSimilarity(normalizedQuery, vector, metric);
      
      if (score >= threshold) {
        const result = { id, score };
        
        if (includeMetadata) {
          result.metadata = { ...metadata };
        }
        
        if (includeVectors) {
          result.vector = [...vector];
        }
        
        results.push(result);
      }
    }
    
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  }

  calculateSimilarity(vecA, vecB, metric) {
    switch (metric) {
      case 'cosine':
        return this.cosineSimilarity(vecA, vecB);
      case 'euclidean':
        return 1 / (1 + this.euclideanDistance(vecA, vecB));
      case 'manhattan':
        return 1 / (1 + this.manhattanDistance(vecA, vecB));
      default:
        throw new Error(`Unknown similarity metric: ${metric}`);
    }
  }

  getCandidateIds(filter, category) {
    if (category) {
      const categoryIds = this.categoryIndex.get(category);
      if (!categoryIds) return new Set();
      
      if (filter) {
        return new Set(Array.from(categoryIds).filter(id => 
          this.applyFilter(filter, this.metadata.get(id))
        ));
      }
      
      return categoryIds;
    }
    
    if (filter) {
      return new Set(Array.from(this.vectors.keys()).filter(id => 
        this.applyFilter(filter, this.metadata.get(id))
      ));
    }
    
    return new Set(this.vectors.keys());
  }

  applyFilter(filter, metadata) {
    if (!filter || !metadata) return true;
    
    for (const [key, value] of Object.entries(filter)) {
      if (Array.isArray(value)) {
        if (!value.includes(metadata[key])) {
          return false;
        }
      } else if (typeof value === 'function') {
        if (!value(metadata[key], metadata)) {
          return false;
        }
      } else if (metadata[key] !== value) {
        return false;
      }
    }
    
    return true;
  }

  searchByCategory(queryVector, category, options = {}) {
    return this.search(queryVector, { ...options, category });
  }

  searchByKeywords(queryVector, keywords, options = {}) {
    const keywordIds = new Set();
    
    keywords.forEach(keyword => {
      const ids = this.keywordIndex.get(keyword);
      if (ids) {
        ids.forEach(id => keywordIds.add(id));
      }
    });

    if (keywordIds.size === 0) {
      return this.search(queryVector, options);
    }

    const filter = options.filter || {};
    const keywordFilter = (metadata) => keywordIds.has(metadata.id);
    
    return this.search(queryVector, {
      ...options,
      filter: {
        ...filter,
        keywordMatch: keywordFilter
      }
    });
  }

  findSimilar(id, options = {}) {
    const item = this.get(id);
    if (!item) {
      throw new Error(`Vector with id '${id}' not found`);
    }
    
    const { k = 5 } = options;
    const results = this.search(item.vector, { ...options, k: k + 1 });
    
    return results.filter(result => result.id !== id).slice(0, k);
  }

  updateIndexes(id, metadata) {
    if (metadata.category) {
      if (!this.categoryIndex.has(metadata.category)) {
        this.categoryIndex.set(metadata.category, new Set());
      }
      this.categoryIndex.get(metadata.category).add(id);
    }
    
    if (metadata.keywords && Array.isArray(metadata.keywords)) {
      metadata.keywords.forEach(keyword => {
        if (!this.keywordIndex.has(keyword)) {
          this.keywordIndex.set(keyword, new Set());
        }
        this.keywordIndex.get(keyword).add(id);
      });
    }
  }

  removeFromIndexes(id) {
    for (const [category, ids] of this.categoryIndex.entries()) {
      ids.delete(id);
      if (ids.size === 0) {
        this.categoryIndex.delete(category);
      }
    }
    
    for (const [keyword, ids] of this.keywordIndex.entries()) {
      ids.delete(id);
      if (ids.size === 0) {
        this.keywordIndex.delete(keyword);
      }
    }
  }

  getByCategory(category) {
    const categoryIds = this.categoryIndex.get(category);
    if (!categoryIds) return [];
    
    return Array.from(categoryIds)
      .map(id => this.get(id))
      .filter(Boolean);
  }

  getByKeyword(keyword) {
    const keywordIds = this.keywordIndex.get(keyword);
    if (!keywordIds) return [];
    
    return Array.from(keywordIds)
      .map(id => this.get(id))
      .filter(Boolean);
  }

  getCategories() {
    return Array.from(this.categoryIndex.keys()).sort();
  }

  getKeywords() {
    return Array.from(this.keywordIndex.keys()).sort();
  }

  cluster(options = {}) {
    const { 
      numClusters = Math.min(5, Math.floor(this.vectors.size / 3)),
      maxIterations = 50,
      tolerance = 0.001,
      metric = 'euclidean'
    } = options;
    
    if (this.vectors.size < numClusters) {
      throw new Error(`Not enough vectors (${this.vectors.size}) for ${numClusters} clusters`);
    }
    
    const vectors = Array.from(this.vectors.entries());
    const centroids = this.initializeCentroids(vectors, numClusters);
    const clusters = new Array(numClusters).fill(null).map(() => []);
    
    let converged = false;
    let iteration = 0;
    
    while (!converged && iteration < maxIterations) {
      clusters.forEach(cluster => cluster.length = 0);
      
      for (const [id, vector] of vectors) {
        let bestCluster = 0;
        let bestScore = this.calculateClusterScore(vector, centroids[0], metric);
        
        for (let i = 1; i < numClusters; i++) {
          const score = this.calculateClusterScore(vector, centroids[i], metric);
          if (score < bestScore) {
            bestScore = score;
            bestCluster = i;
          }
        }
        
        clusters[bestCluster].push({ 
          id, 
          vector, 
          distance: bestScore,
          metadata: this.metadata.get(id)
        });
      }
      
      const newCentroids = this.updateCentroids(clusters);
      const convergence = this.calculateConvergence(centroids, newCentroids);
      
      converged = convergence < tolerance;
      centroids.splice(0, centroids.length, ...newCentroids);
      iteration++;
    }
    
    return clusters.map((cluster, index) => ({
      id: index,
      centroid: centroids[index],
      vectors: cluster.map(({ id, distance, metadata }) => ({ 
        id, 
        distance, 
        category: metadata?.category || 'unknown'
      })),
      size: cluster.length,
      categories: this.getClusterCategories(cluster)
    }));
  }

  calculateClusterScore(vector, centroid, metric) {
    return metric === 'euclidean' ? 
      this.euclideanDistance(vector, centroid) :
      1 - this.cosineSimilarity(vector, centroid);
  }

  initializeCentroids(vectors, numClusters) {
    const centroids = [];
    const shuffled = [...vectors].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < numClusters; i++) {
      centroids.push([...shuffled[i][1]]);
    }
    
    return centroids;
  }

  updateCentroids(clusters) {
    return clusters.map(cluster => {
      if (cluster.length === 0) {
        return new Array(this.dimension).fill(0);
      }
      
      const centroid = new Array(this.dimension).fill(0);
      
      cluster.forEach(({ vector }) => {
        for (let i = 0; i < this.dimension; i++) {
          centroid[i] += vector[i];
        }
      });
      
      return centroid.map(val => val / cluster.length);
    });
  }

  calculateConvergence(oldCentroids, newCentroids) {
    let totalDistance = 0;
    
    for (let i = 0; i < oldCentroids.length; i++) {
      totalDistance += this.euclideanDistance(oldCentroids[i], newCentroids[i]);
    }
    
    return totalDistance / oldCentroids.length;
  }

  getClusterCategories(cluster) {
    const categories = new Map();
    
    cluster.forEach(({ metadata }) => {
      if (metadata?.category) {
        categories.set(metadata.category, (categories.get(metadata.category) || 0) + 1);
      }
    });
    
    return Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }));
  }

  getStats() {
    const memoryUsage = this.calculateMemoryUsage();
    
    return {
      count: this.vectors.size,
      dimension: this.dimension,
      maxVectors: this.maxVectors,
      categories: this.categoryIndex.size,
      keywords: this.keywordIndex.size,
      isDirty: this.isDirty,
      lastSave: this.lastSave,
      memoryUsage,
      averageVectorMagnitude: this.calculateAverageVectorMagnitude()
    };
  }

  calculateMemoryUsage() {
    const vectorMemory = this.vectors.size * this.dimension * 8;
    const metadataMemory = Array.from(this.metadata.values())
      .reduce((total, meta) => total + JSON.stringify(meta).length * 2, 0);
    const indexMemory = (this.categoryIndex.size + this.keywordIndex.size) * 100;
    
    return {
      vectors: vectorMemory,
      metadata: metadataMemory,
      indexes: indexMemory,
      total: vectorMemory + metadataMemory + indexMemory
    };
  }

  calculateAverageVectorMagnitude() {
    if (this.vectors.size === 0) return 0;
    
    let totalMagnitude = 0;
    
    for (const vector of this.vectors.values()) {
      const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
      totalMagnitude += magnitude;
    }
    
    return totalMagnitude / this.vectors.size;
  }

  export(includeVectors = true) {
    const data = {
      version: '2.0',
      timestamp: Date.now(),
      dimension: this.dimension,
      count: this.vectors.size,
      metadata: Object.fromEntries(this.metadata),
      categoryIndex: Object.fromEntries(
        Array.from(this.categoryIndex.entries()).map(([k, v]) => [k, Array.from(v)])
      ),
      keywordIndex: Object.fromEntries(
        Array.from(this.keywordIndex.entries()).map(([k, v]) => [k, Array.from(v)])
      )
    };
    
    if (includeVectors) {
      data.vectors = Object.fromEntries(this.vectors);
    }
    
    return data;
  }

  import(data) {
    if (!data.version || !data.metadata) {
      throw new Error('Invalid import data format');
    }
    
    if (data.dimension && data.dimension !== this.dimension) {
      console.warn(`Dimension mismatch: expected ${this.dimension}, got ${data.dimension}`);
    }
    
    this.clear();
    
    if (data.vectors && data.metadata) {
      for (const [id, vector] of Object.entries(data.vectors)) {
        const metadata = data.metadata[id];
        if (vector && metadata) {
          this.add(id, vector, metadata);
        }
      }
    }
    
    if (data.categoryIndex) {
      this.categoryIndex.clear();
      for (const [category, ids] of Object.entries(data.categoryIndex)) {
        this.categoryIndex.set(category, new Set(ids));
      }
    }
    
    if (data.keywordIndex) {
      this.keywordIndex.clear();
      for (const [keyword, ids] of Object.entries(data.keywordIndex)) {
        this.keywordIndex.set(keyword, new Set(ids));
      }
    }
    
    this.isDirty = false;
    return { imported: this.vectors.size };
  }

  save() {
    if (!this.isDirty) {
      return { saved: false, reason: 'No changes to save' };
    }
    
    try {
      const data = this.export();
      const tempPath = this.persistencePath + '.tmp';
      
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
      
      if (fs.existsSync(this.persistencePath)) {
        fs.unlinkSync(this.persistencePath);
      }
      
      fs.renameSync(tempPath, this.persistencePath);
      
      this.isDirty = false;
      this.lastSave = Date.now();
      
      return { 
        saved: true, 
        path: this.persistencePath,
        size: fs.statSync(this.persistencePath).size,
        count: this.vectors.size,
        timestamp: this.lastSave
      };
    } catch (error) {
      console.error('Save failed:', error);
      throw new Error(`Failed to save vector store: ${error.message}`);
    }
  }

  load() {
    if (!fs.existsSync(this.persistencePath)) {
      return { loaded: false, reason: 'File not found' };
    }
    
    try {
      const data = JSON.parse(fs.readFileSync(this.persistencePath, 'utf8'));
      const result = this.import(data);
      this.lastSave = Date.now();
      
      return { 
        loaded: true, 
        ...result,
        path: this.persistencePath,
        version: data.version || '1.0'
      };
    } catch (error) {
      console.error('Load failed:', error);
      return { loaded: false, reason: error.message };
    }
  }

  clear() {
    this.vectors.clear();
    this.metadata.clear();
    this.categoryIndex.clear();
    this.keywordIndex.clear();
    this.markDirty();
  }

  markDirty() {
    this.isDirty = true;
    
    if (this.autoSave) {
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
      }
      
      this.saveTimeout = setTimeout(() => {
        if (this.isDirty) {
          try {
            this.save();
          } catch (error) {
            console.error('Auto-save failed:', error);
          }
        }
      }, this.saveDelay);
    }
  }

  optimize() {
    const beforeStats = this.getStats();
    
    const validIds = new Set();
    const orphanedVectors = [];
    const orphanedMetadata = [];
    
    for (const [id, vector] of this.vectors.entries()) {
      if (this.metadata.has(id) && vector && vector.length === this.dimension) {
        validIds.add(id);
      } else {
        orphanedVectors.push(id);
      }
    }
    
    for (const id of this.metadata.keys()) {
      if (!validIds.has(id)) {
        orphanedMetadata.push(id);
      }
    }
    
    orphanedVectors.forEach(id => this.vectors.delete(id));
    orphanedMetadata.forEach(id => this.metadata.delete(id));
    
    this.categoryIndex.clear();
    this.keywordIndex.clear();
    
    for (const [id, metadata] of this.metadata.entries()) {
      this.updateIndexes(id, metadata);
    }
    
    if (orphanedVectors.length > 0 || orphanedMetadata.length > 0) {
      this.markDirty();
    }
    
    const afterStats = this.getStats();
    
    return {
      before: beforeStats,
      after: afterStats,
      removed: beforeStats.count - afterStats.count,
      orphanedVectors: orphanedVectors.length,
      orphanedMetadata: orphanedMetadata.length
    };
  }
}

module.exports = VectorStore;