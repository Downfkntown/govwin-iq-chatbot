/**
 * Staging Environment Configuration
 * GovWin IQ Customer Success Chatbot - Staging Deployment
 * 
 * This configuration provides staging-specific settings including:
 * - Port configuration and server binding
 * - Enhanced logging for debugging and monitoring
 * - Performance monitoring and metrics collection
 * - Staging-specific security settings
 * - Database and cache configuration for staging
 * - Agent system configuration for testing
 */

const path = require('path');
const os = require('os');

const stagingConfig = {
  // Environment identification
  environment: 'staging',
  version: '1.0.0-staging',
  buildId: process.env.BUILD_ID || 'manual-build',
  deploymentTime: new Date().toISOString(),

  // Server configuration
  server: {
    port: process.env.STAGING_PORT || 3002,
    host: process.env.STAGING_HOST || '0.0.0.0',
    protocol: 'http',
    baseUrl: process.env.STAGING_BASE_URL || 'http://localhost:3002',
    
    // Connection settings
    timeout: 30000,
    keepAliveTimeout: 65000,
    headersTimeout: 66000,
    maxHeaderSize: 16384,
    
    // Body parsing limits
    bodyLimit: '10mb',
    parameterLimit: 1000,
    
    // CORS configuration for staging
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'https://staging.govwin.com',
        'https://staging-iq.govwin.com'
      ],
      credentials: true,
      optionsSuccessStatus: 200,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With',
        'X-Session-Id',
        'X-Agent-Context',
        'X-Performance-Monitor'
      ]
    }
  },

  // Enhanced logging configuration for staging
  logging: {
    level: 'debug',
    format: 'combined',
    
    // Console logging
    console: {
      enabled: true,
      level: 'info',
      colorize: true,
      timestamp: true,
      json: false
    },
    
    // File logging
    file: {
      enabled: true,
      level: 'debug',
      directory: path.join(__dirname, '..', 'logs', 'staging'),
      filename: 'govwin-chatbot-staging.log',
      maxSize: '50MB',
      maxFiles: 10,
      rotationInterval: '1d',
      compress: true
    },
    
    // Error logging
    error: {
      enabled: true,
      directory: path.join(__dirname, '..', 'logs', 'staging'),
      filename: 'errors.log',
      maxSize: '20MB',
      maxFiles: 5
    },
    
    // Agent-specific logging
    agents: {
      enabled: true,
      level: 'debug',
      directory: path.join(__dirname, '..', 'logs', 'staging'),
      filename: 'agents.log',
      includePerformance: true,
      includeRouting: true,
      includeContext: true
    },
    
    // Performance logging
    performance: {
      enabled: true,
      level: 'info',
      slowQueryThreshold: 1000,
      slowAgentThreshold: 2000,
      memoryMonitoring: true,
      diskSpaceMonitoring: true
    }
  },

  // Performance monitoring configuration
  monitoring: {
    enabled: true,
    
    // Health checks
    health: {
      enabled: true,
      interval: 30000,
      timeout: 5000,
      endpoints: [
        '/api/v1/system/health',
        '/api/v1/system/stats'
      ]
    },
    
    // Metrics collection
    metrics: {
      enabled: true,
      interval: 60000,
      
      // System metrics
      system: {
        cpu: true,
        memory: true,
        disk: true,
        network: false
      },
      
      // Application metrics
      application: {
        responseTime: true,
        requestCount: true,
        errorRate: true,
        agentPerformance: true,
        ragPerformance: true
      },
      
      // Agent-specific metrics
      agents: {
        routingAccuracy: true,
        responseTime: true,
        confidenceScores: true,
        contextSwitches: true,
        sessionDuration: true
      }
    },
    
    // Performance thresholds for alerts
    thresholds: {
      responseTime: 2000,
      errorRate: 0.05,
      cpuUsage: 0.8,
      memoryUsage: 0.85,
      diskUsage: 0.9,
      agentResponseTime: 3000,
      lowConfidenceThreshold: 0.3
    },
    
    // Alerting configuration
    alerts: {
      enabled: true,
      channels: ['console', 'file'],
      webhookUrl: process.env.STAGING_WEBHOOK_URL,
      emailRecipients: process.env.STAGING_ALERT_EMAILS?.split(',') || [],
      
      // Alert rules
      rules: {
        highErrorRate: {
          enabled: true,
          threshold: 0.1,
          duration: 300000
        },
        slowResponse: {
          enabled: true,
          threshold: 5000,
          duration: 180000
        },
        highMemoryUsage: {
          enabled: true,
          threshold: 0.9,
          duration: 600000
        }
      }
    }
  },

  // Database configuration for staging
  database: {
    // Vector store configuration
    vectorStore: {
      persistencePath: path.join(__dirname, '..', 'data', 'staging', 'vectors.json'),
      backupPath: path.join(__dirname, '..', 'backups', 'staging'),
      autoSave: true,
      saveInterval: 300000,
      maxVectors: 10000,
      dimension: 200,
      backupInterval: 3600000,
      maxBackups: 24
    },
    
    // FAQ service configuration
    faq: {
      knowledgeBasePath: path.join(__dirname, '..', 'knowledge-base', 'govwin-iq-knowledge-base.md'),
      cachePath: path.join(__dirname, '..', 'cache', 'staging', 'faq-cache.json'),
      cacheTimeout: 1800000,
      reloadInterval: 600000
    },
    
    // Session storage
    sessions: {
      storage: 'memory',
      ttl: 7200000,
      maxSessions: 1000,
      cleanupInterval: 600000
    }
  },

  // Agent system configuration for staging
  agents: {
    // Agent registry settings
    registry: {
      autoDiscovery: true,
      agentTimeout: 5000,
      maxConcurrentAgents: 10,
      
      // Agent-specific configurations
      agents: {
        federal: {
          enabled: true,
          priority: 'high',
          timeout: 8000,
          cacheEnabled: true,
          cacheTtl: 900000
        },
        sled: {
          enabled: true,
          priority: 'high',
          timeout: 8000,
          cacheEnabled: true,
          cacheTtl: 900000
        },
        regionalLocalMarkets: {
          enabled: true,
          priority: 'high',
          timeout: 8000,
          cacheEnabled: true,
          cacheTtl: 900000
        },
        searchOrchestrator: {
          enabled: true,
          priority: 'critical',
          timeout: 10000,
          cacheEnabled: false
        },
        alertManager: {
          enabled: true,
          priority: 'high',
          timeout: 6000,
          cacheEnabled: true,
          cacheTtl: 300000
        },
        reportGenerator: {
          enabled: true,
          priority: 'medium',
          timeout: 15000,
          cacheEnabled: true,
          cacheTtl: 1800000
        }
      }
    },
    
    // Intent router configuration
    router: {
      confidenceThreshold: 0.25,
      fallbackAgent: 'conversationManager',
      maxRoutingTime: 2000,
      enableMultiAgentRouting: true,
      
      // Routing strategies
      strategies: {
        default: 'confidence_based',
        fallback: 'round_robin',
        loadBalancing: false
      }
    },
    
    // Context manager settings
    context: {
      sessionTimeout: 3600000,
      maxContextSize: 1000000,
      contextPersistence: true,
      compressionEnabled: false,
      
      // Context cleanup
      cleanup: {
        enabled: true,
        interval: 1800000,
        maxAge: 86400000
      }
    },
    
    // Response coordinator settings
    coordinator: {
      maxResponseTime: 10000,
      conflictResolutionStrategy: 'priority_based',
      aggregationStrategy: 'weighted_average',
      maxSourcesPerResponse: 5
    }
  },

  // Security configuration for staging
  security: {
    // Rate limiting
    rateLimit: {
      enabled: true,
      windowMs: 900000,
      max: 1000,
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    },
    
    // Request validation
    validation: {
      enabled: true,
      strictMode: false,
      maxRequestSize: '10mb',
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      sanitizeInput: true
    },
    
    // HTTPS configuration (if applicable)
    https: {
      enabled: false,
      enforceHttps: false,
      hstsEnabled: false
    },
    
    // API key validation (if needed)
    apiKeys: {
      enabled: false,
      required: false,
      header: 'X-API-Key'
    }
  },

  // Cache configuration
  cache: {
    enabled: true,
    
    // Memory cache
    memory: {
      enabled: true,
      maxSize: 100,
      ttl: 600000,
      checkPeriod: 120000
    },
    
    // Agent response caching
    agentCache: {
      enabled: true,
      maxSize: 500,
      ttl: 900000,
      keyPattern: 'agent:{agentId}:{hash}'
    },
    
    // RAG result caching
    ragCache: {
      enabled: true,
      maxSize: 1000,
      ttl: 1800000,
      keyPattern: 'rag:{hash}'
    }
  },

  // Development and testing features
  development: {
    // Mock data
    mockData: {
      enabled: true,
      generateTestData: true,
      seedDatabase: false
    },
    
    // Debug features
    debug: {
      enabled: true,
      verboseLogging: true,
      showStackTraces: true,
      enableDebugRoutes: true,
      performanceProfiling: true
    },
    
    // Hot reloading (for development)
    hotReload: {
      enabled: false,
      watchPaths: ['agents/', 'rag/', 'conversation-flows/'],
      ignorePatterns: ['*.log', '*.tmp', 'node_modules/']
    }
  },

  // External service configuration
  external: {
    // GovWin IQ API integration (staging endpoints)
    govwinApi: {
      baseUrl: process.env.GOVWIN_STAGING_API_URL || 'https://api-staging.govwin.com',
      apiKey: process.env.GOVWIN_STAGING_API_KEY,
      timeout: 30000,
      retries: 3,
      retryDelay: 1000
    },
    
    // Analytics services
    analytics: {
      enabled: true,
      provider: 'internal',
      trackingId: process.env.STAGING_TRACKING_ID,
      sampleRate: 1.0
    }
  }
};

// Environment validation
function validateStagingConfig() {
  const errors = [];
  
  // Check required directories
  const requiredDirs = [
    stagingConfig.logging.file.directory,
    stagingConfig.database.vectorStore.backupPath,
    path.dirname(stagingConfig.database.faq.cachePath)
  ];
  
  // Validate configuration integrity
  if (!stagingConfig.server.port || stagingConfig.server.port < 1024 || stagingConfig.server.port > 65535) {
    errors.push('Invalid server port configuration');
  }
  
  if (!stagingConfig.logging.level || !['debug', 'info', 'warn', 'error'].includes(stagingConfig.logging.level)) {
    errors.push('Invalid logging level configuration');
  }
  
  if (stagingConfig.agents.registry.maxConcurrentAgents < 1) {
    errors.push('Invalid max concurrent agents configuration');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors,
    requiredDirectories: requiredDirs
  };
}

// Configuration initialization
function initializeStagingConfig() {
  console.log('=' Initializing staging configuration...');
  
  const validation = validateStagingConfig();
  
  if (!validation.valid) {
    console.error('L Configuration validation failed:');
    validation.errors.forEach(error => console.error(`   - ${error}`));
    process.exit(1);
  }
  
  console.log(' Staging configuration validated successfully');
  console.log(`=Ê Environment: ${stagingConfig.environment}`);
  console.log(`=€ Server will start on: ${stagingConfig.server.host}:${stagingConfig.server.port}`);
  console.log(`=Ý Logging level: ${stagingConfig.logging.level}`);
  console.log(`> Agents enabled: ${Object.keys(stagingConfig.agents.registry.agents).length}`);
  console.log(`=È Monitoring enabled: ${stagingConfig.monitoring.enabled ? 'Yes' : 'No'}`);
  
  return stagingConfig;
}

// Export configuration and utilities
module.exports = {
  config: stagingConfig,
  validate: validateStagingConfig,
  initialize: initializeStagingConfig,
  
  // Convenience getters
  getServerConfig: () => stagingConfig.server,
  getLoggingConfig: () => stagingConfig.logging,
  getMonitoringConfig: () => stagingConfig.monitoring,
  getAgentConfig: () => stagingConfig.agents,
  getDatabaseConfig: () => stagingConfig.database,
  getSecurityConfig: () => stagingConfig.security,
  
  // Environment utilities
  isStaging: () => stagingConfig.environment === 'staging',
  getVersion: () => stagingConfig.version,
  getBuildInfo: () => ({
    version: stagingConfig.version,
    buildId: stagingConfig.buildId,
    deploymentTime: stagingConfig.deploymentTime,
    environment: stagingConfig.environment
  })
};