const fs = require('fs');
const path = require('path');

class VectorStore {
  constructor(options = {}) {
    this.dimension = options.dimension || 200;
    this.persistencePath = options.persistencePath || path.join(__dirname, 'faq-vectors.json');
    this.autoSave = options.autoSave !== false;
    this.maxVectors = options.maxVectors || 1000;
    
    this.vectors = new Map();
    this.metadata = new Map();
    this.searchIndex = new Map();
    this.isDirty = false;
    this.lastSave = 0;
    
    if (options.loadOnInit !== false) {
      this.load();
    }
  }

  add(id, vector, metadata = {}) {
    this.validateVector(vector);
    
    if (!id || typeof id !== 'string') {
      throw new Error('Vector ID must be a non-empty string');
    }
    
    if (this.vectors.size >= this.maxVectors && !this.vectors.has(id)) {
      throw new Error(`Maximum vector limit (${this.maxVectors}) reached`);
    }
    
    const normalizedVector = this.normalizeVector(vector);
    
    this.vectors.set(id, normalizedVector);
    this.metadata.set(id, {
      id,
      ...metadata,
      timestamp: Date.now(),
      dimension: this.dimension
    });
    
    this.updateSearchIndex(id, normalizedVector, metadata);
    this.markDirty();
    
    return id;
  }

  addBatch(items) {
    const results = [];
    const errors = [];
    
    for (const item of items) {
      try {
        const id = this.add(item.id, item.vector, item.metadata);
        results.push({ id, success: true });
      } catch (error) {
        errors.push({ 
          id: item.id || 'unknown', 
          error: error.message, 
          success: false 
        });
      }
    }
    
    return { 
      successful: results.length, 
      failed: errors.length, 
      total: items.length,
      errors 
    };
  }

  get(id) {
    const vector = this.vectors.get(id);
    const metadata = this.metadata.get(id);
    
    if (!vector || !metadata) {
      return null;
    }
    
    return { id, vector: [...vector], metadata: { ...metadata } };
  }

  update(id, vector = null, metadata = null) {
    if (!this.vectors.has(id)) {
      throw new Error(`Vector with id '${id}' not found`);
    }
    
    if (vector !== null) {
      this.validateVector(vector);
      const normalizedVector = this.normalizeVector(vector);
      this.vectors.set(id, normalizedVector);
      this.updateSearchIndex(id, normalizedVector, this.metadata.get(id));
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
      this.updateSearchIndex(id, this.vectors.get(id), updatedMetadata);
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
      this.removeFromSearchIndex(id);
      this.markDirty();
      return true;
    }
    
    return false;
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

  normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(val => val / magnitude) : new Array(vector.length).fill(0);
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

  search(queryVector, options = {}) {
    this.validateVector(queryVector);
    
    const {
      k = 5,
      threshold = 0.0,
      metric = 'cosine',
      includeMetadata = true,
      includeVectors = false,
      filter = null
    } = options;
    
    const normalizedQuery = this.normalizeVector(queryVector);
    const results = [];
    
    for (const [id, vector] of this.vectors.entries()) {
      const metadata = this.metadata.get(id);
      
      if (filter && !this.applyFilter(filter, metadata)) {
        continue;
      }
      
      let score;
      switch (metric) {
        case 'cosine':
          score = this.cosineSimilarity(normalizedQuery, vector);
          break;
        case 'euclidean':
          score = 1 / (1 + this.euclideanDistance(normalizedQuery, vector));
          break;
        default:
          throw new Error(`Unknown similarity metric: ${metric}`);
      }
      
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
    
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, k);
  }

  searchByCategory(queryVector, category, options = {}) {
    return this.search(queryVector, {
      ...options,
      filter: { category }
    });
  }

  findSimilarVectors(id, options = {}) {
    const item = this.get(id);
    if (!item) {
      throw new Error(`Vector with id '${id}' not found`);
    }
    
    const { k = 5 } = options;
    const results = this.search(item.vector, { ...options, k: k + 1 });
    
    return results.filter(result => result.id !== id).slice(0, k);
  }

  applyFilter(filter, metadata) {
    for (const [key, value] of Object.entries(filter)) {
      if (Array.isArray(value)) {
        if (!value.includes(metadata[key])) {
          return false;
        }
      } else if (metadata[key] !== value) {
        return false;
      }
    }
    return true;
  }

  updateSearchIndex(id, vector, metadata) {
    if (!metadata.category) return;
    
    const categoryKey = `category:${metadata.category}`;
    if (!this.searchIndex.has(categoryKey)) {
      this.searchIndex.set(categoryKey, new Set());
    }
    
    this.searchIndex.get(categoryKey).add(id);
  }

  removeFromSearchIndex(id) {
    for (const [key, idSet] of this.searchIndex.entries()) {
      idSet.delete(id);
      if (idSet.size === 0) {
        this.searchIndex.delete(key);
      }
    }
  }

  getByCategory(category) {
    const categoryKey = `category:${category}`;
    const categoryIds = this.searchIndex.get(categoryKey);
    
    if (!categoryIds) {
      return [];
    }
    
    return Array.from(categoryIds).map(id => this.get(id)).filter(Boolean);
  }

  getCategories() {
    const categories = new Set();
    
    for (const metadata of this.metadata.values()) {
      if (metadata.category) {
        categories.add(metadata.category);
      }
    }
    
    return Array.from(categories).sort();
  }

  cluster(options = {}) {
    const { 
      numClusters = 5, 
      maxIterations = 50,
      tolerance = 0.001
    } = options;
    
    if (this.vectors.size < numClusters) {
      throw new Error(`Not enough vectors (${this.vectors.size}) for ${numClusters} clusters`);
    }
    
    const vectors = Array.from(this.vectors.entries());
    const centroids = this.initializeCentroids(vectors, numClusters);
    const clusters = new Array(numClusters).fill(null).map(() => []);
    
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      clusters.forEach(cluster => cluster.length = 0);
      
      for (const [id, vector] of vectors) {
        let bestCluster = 0;
        let bestDistance = this.euclideanDistance(vector, centroids[0]);
        
        for (let i = 1; i < numClusters; i++) {
          const distance = this.euclideanDistance(vector, centroids[i]);
          if (distance < bestDistance) {
            bestDistance = distance;
            bestCluster = i;
          }
        }
        
        clusters[bestCluster].push({ id, vector, distance: bestDistance });
      }
      
      const newCentroids = this.updateCentroids(clusters);
      const convergence = this.calculateConvergence(centroids, newCentroids);
      
      if (convergence < tolerance) {
        break;
      }
      
      centroids.splice(0, centroids.length, ...newCentroids);
    }
    
    return clusters.map((cluster, index) => ({
      id: index,
      centroid: centroids[index],
      vectors: cluster.map(({ id, distance }) => ({ id, distance })),
      size: cluster.length
    }));
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
      
      for (const { vector } of cluster) {
        for (let i = 0; i < this.dimension; i++) {
          centroid[i] += vector[i];
        }
      }
      
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

  getStats() {
    const memoryUsage = this.calculateMemoryUsage();
    
    return {
      count: this.vectors.size,
      dimension: this.dimension,
      maxVectors: this.maxVectors,
      categories: this.getCategories().length,
      isDirty: this.isDirty,
      lastSave: this.lastSave,
      memoryUsage,
      searchIndexSize: this.searchIndex.size
    };
  }

  calculateMemoryUsage() {
    const vectorMemory = this.vectors.size * this.dimension * 8;
    const metadataSize = Array.from(this.metadata.values())
      .reduce((size, meta) => size + JSON.stringify(meta).length, 0) * 2;
    const indexMemory = this.searchIndex.size * 100;
    
    return {
      vectors: vectorMemory,
      metadata: metadataSize,
      searchIndex: indexMemory,
      total: vectorMemory + metadataSize + indexMemory
    };
  }

  export(includeVectors = true) {
    const data = {
      version: '1.1',
      timestamp: Date.now(),
      dimension: this.dimension,
      count: this.vectors.size,
      metadata: Object.fromEntries(this.metadata),
      searchIndex: Object.fromEntries(
        Array.from(this.searchIndex.entries()).map(([k, v]) => [k, Array.from(v)])
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
    
    if (data.vectors) {
      for (const [id, vector] of Object.entries(data.vectors)) {
        const metadata = data.metadata[id];
        if (vector && metadata) {
          this.add(id, vector, metadata);
        }
      }
    } else {
      for (const [id, metadata] of Object.entries(data.metadata)) {
        this.metadata.set(id, metadata);
      }
    }
    
    if (data.searchIndex) {
      this.searchIndex.clear();
      for (const [key, ids] of Object.entries(data.searchIndex)) {
        this.searchIndex.set(key, new Set(ids));
      }
    }
    
    this.isDirty = false;
    return { imported: this.vectors.size };
  }

  save() {
    if (!this.isDirty && fs.existsSync(this.persistencePath)) {
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
        count: this.vectors.size
      };
    } catch (error) {
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
        path: this.persistencePath
      };
    } catch (error) {
      console.error(`Failed to load vector store: ${error.message}`);
      return { loaded: false, reason: error.message };
    }
  }

  clear() {
    this.vectors.clear();
    this.metadata.clear();
    this.searchIndex.clear();
    this.markDirty();
  }

  markDirty() {
    this.isDirty = true;
    if (this.autoSave && Date.now() - this.lastSave > 5000) {
      setTimeout(() => {
        if (this.isDirty) {
          this.save();
        }
      }, 1000);
    }
  }

  optimize() {
    const beforeCount = this.vectors.size;
    
    const validIds = new Set();
    for (const [id, vector] of this.vectors.entries()) {
      if (this.metadata.has(id) && vector && vector.length === this.dimension) {
        validIds.add(id);
      }
    }
    
    const orphanedVectors = [];
    const orphanedMetadata = [];
    
    for (const id of this.vectors.keys()) {
      if (!validIds.has(id)) {
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
    
    this.searchIndex.clear();
    for (const [id, metadata] of this.metadata.entries()) {
      const vector = this.vectors.get(id);
      if (vector) {
        this.updateSearchIndex(id, vector, metadata);
      }
    }
    
    if (orphanedVectors.length > 0 || orphanedMetadata.length > 0) {
      this.markDirty();
    }
    
    return {
      before: beforeCount,
      after: this.vectors.size,
      removed: beforeCount - this.vectors.size,
      orphanedVectors: orphanedVectors.length,
      orphanedMetadata: orphanedMetadata.length
    };
  }
}

module.exports = VectorStore;