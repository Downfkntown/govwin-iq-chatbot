const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import our components
const { DatabaseConfig, AppConfig, RedisClient, Logger } = require('./lib/infrastructure');
const { BasicCSMCoordinator } = require('./lib/basic-csm-coordinator');

class GovWinCSMServer {
    constructor() {
        this.app = express();
        this.appConfig = new AppConfig();
        this.dbConfig = new DatabaseConfig();
        this.logger = new Logger(this.appConfig.get('logging').level);
        this.redisClient = null;
        this.csmCoordinator = null;
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    setupMiddleware() {
        // Security
        this.app.use(helmet());
        
        // CORS
        this.app.use(cors({
            origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
            credentials: true
        }));
        
        // Compression
        this.app.use(compression());
        
        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        
        // Rate limiting
        const limiter = rateLimit({
            windowMs: this.appConfig.get('rateLimiting').windowMs,
            max: this.appConfig.get('rateLimiting').max,
            message: {
                error: 'Too many requests from this IP, please try again later.',
                retryAfter: Math.ceil(this.appConfig.get('rateLimiting').windowMs / 1000)
            },
            standardHeaders: true,
            legacyHeaders: false
        });
        this.app.use('/api/', limiter);
        
        // Request logging
        this.app.use((req, res, next) => {
            this.logger.info('Request received', {
                method: req.method,
                url: req.url,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            next();
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', async (req, res) => {
            try {
                const redisHealth = this.redisClient ? await this.redisClient.healthCheck() : { status: 'not_initialized' };
                const csmMetrics = this.csmCoordinator ? await this.csmCoordinator.getMetrics() : null;
                
                const health = {
                    status: 'ok',
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    redis: redisHealth,
                    csm: csmMetrics ? {
                        totalQueries: csmMetrics.totalQueries,
                        successRate: csmMetrics.totalQueries > 0 ? 
                            (csmMetrics.successfulQueries / csmMetrics.totalQueries * 100).toFixed(2) : 0,
                        averageLatency: Math.round(csmMetrics.averageLatency),
                        activeConversations: csmMetrics.activeConversations
                    } : { status: 'not_initialized' }
                };
                
                res.json(health);
            } catch (error) {
                res.status(500).json({
                    status: 'error',
                    error: error.message
                });
            }
        });

        // System status endpoint
        this.app.get('/api/v1/system/status', async (req, res) => {
            try {
                const metrics = this.csmCoordinator ? await this.csmCoordinator.getMetrics() : null;
                
                res.json({
                    service: 'GovWin CSM',
                    version: '1.0.0',
                    status: this.csmCoordinator ? 'operational' : 'initializing',
                    timestamp: new Date().toISOString(),
                    metrics: metrics
                });
            } catch (error) {
                res.status(500).json({
                    service: 'GovWin CSM',
                    status: 'error',
                    error: error.message
                });
            }
        });

        // Main CSM chat endpoint
        this.app.post('/api/v1/chat/message', async (req, res) => {
            try {
                const { message, userId, sessionId } = req.body;
                
                // Validate request
                if (!message || typeof message !== 'string' || message.trim().length === 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'Message is required and must be a non-empty string'
                    });
                }
                
                const finalUserId = userId || sessionId || `anonymous_${Date.now()}`;
                
                // Process query through CSM system
                const result = await this.csmCoordinator.processQuery(
                    message.trim(),
                    finalUserId,
                    { 
                        userAgent: req.get('User-Agent'),
                        ip: req.ip
                    }
                );
                
                // Format response for frontend
                const response = {
                    success: true,
                    queryId: result.queryId,
                    message: this.formatMessageForUI(result),
                    guidance: result.csmGuidance,
                    nextSteps: this.extractNextSteps(result),
                    escalationSuggested: result.escalationSuggested || false,
                    fromCache: result.fromCache || false,
                    timestamp: result.timestamp
                };
                
                this.logger.info('Chat response sent', { 
                    queryId: result.queryId,
                    userId: finalUserId,
                    fromCache: result.fromCache,
                    escalationSuggested: result.escalationSuggested
                });
                
                res.json(response);
                
            } catch (error) {
                this.logger.error('Chat endpoint error', { 
                    error: error.message,
                    stack: error.stack
                });
                
                res.status(500).json({
                    success: false,
                    message: "I'm experiencing high demand right now. Let me connect you with a Customer Success Manager who can provide immediate assistance.",
                    escalationSuggested: true,
                    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
                });
            }
        });

        // Get conversation history endpoint
        this.app.get('/api/v1/chat/history/:userId', async (req, res) => {
            try {
                const { userId } = req.params;
                
                if (!this.csmCoordinator) {
                    return res.status(503).json({
                        success: false,
                        error: 'CSM system not initialized'
                    });
                }
                
                const history = await this.csmCoordinator.conversationManager.getConversationHistory(userId);
                
                res.json({
                    success: true,
                    userId,
                    history,
                    count: history.length
                });
                
            } catch (error) {
                this.logger.error('History endpoint error', { 
                    userId: req.params.userId,
                    error: error.message
                });
                
                res.status(500).json({
                    success: false,
                    error: 'Failed to retrieve conversation history'
                });
            }
        });

        // Admin metrics endpoint
        this.app.get('/api/v1/admin/metrics', async (req, res) => {
            try {
                if (!this.csmCoordinator) {
                    return res.status(503).json({
                        success: false,
                        error: 'CSM system not initialized'
                    });
                }
                
                const metrics = await this.csmCoordinator.getMetrics();
                
                res.json({
                    success: true,
                    metrics,
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                this.logger.error('Metrics endpoint error', { error: error.message });
                
                res.status(500).json({
                    success: false,
                    error: 'Failed to retrieve metrics'
                });
            }
        });
    }

    setupErrorHandling() {
        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Route not found',
                path: req.originalUrl,
                availableEndpoints: [
                    'GET /health',
                    'GET /api/v1/system/status',
                    'POST /api/v1/chat/message',
                    'GET /api/v1/chat/history/:userId',
                    'GET /api/v1/admin/metrics'
                ]
            });
        });

        // Global error handler
        this.app.use((error, req, res, next) => {
            this.logger.error('Unhandled error', {
                error: error.message,
                stack: error.stack,
                url: req.url,
                method: req.method
            });

            res.status(500).json({
                error: 'Internal server error',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
                queryId: req.body?.queryId || null
            });
        });
    }

    async initialize() {
        try {
            this.logger.info('Initializing GovWin CSM Server...');
            
            // Connect to Redis
            this.redisClient = new RedisClient(this.dbConfig.getRedisConfig());
            await this.redisClient.connect();
            
            // Initialize CSM Coordinator
            this.csmCoordinator = new BasicCSMCoordinator(
                this.redisClient,
                this.logger,
                this.appConfig.getAll()
            );
            
            this.logger.info('Server initialized successfully');
            
        } catch (error) {
            this.logger.error('Failed to initialize server', { error: error.message });
            throw error;
        }
    }

    async start() {
        await this.initialize();
        
        const port = this.appConfig.get('port');
        
        this.server = this.app.listen(port, () => {
            this.logger.info(`GovWin CSM Server running on port ${port}`, {
                environment: this.appConfig.get('env'),
                port,
                endpoints: [
                    `http://localhost:${port}/health`,
                    `http://localhost:${port}/api/v1/system/status`,
                    `http://localhost:${port}/api/v1/chat/message`
                ]
            });
        });

        // Graceful shutdown
        process.on('SIGTERM', () => this.shutdown());
        process.on('SIGINT', () => this.shutdown());
        
        return this.server;
    }

    async shutdown() {
        this.logger.info('Shutting down server...');
        
        if (this.server) {
            this.server.close();
        }
        
        if (this.redisClient) {
            await this.redisClient.disconnect();
        }
        
        this.logger.info('Server shutdown complete');
        process.exit(0);
    }

    // Helper methods for response formatting
    formatMessageForUI(result) {
        if (!result.csmGuidance || result.csmGuidance.length === 0) {
            return "I'm here to help you navigate GovWin IQ. What can I assist you with today?";
        }
        
        if (result.csmGuidance.length === 1) {
            return result.csmGuidance[0].content;
        }
        
        // Combine multiple guidance responses
        const primary = result.csmGuidance.find(g => g.role === 'primary');
        const secondary = result.csmGuidance.filter(g => g.role === 'secondary');
        
        let formatted = primary ? primary.content : '';
        
        if (secondary.length > 0) {
            formatted += '\n\nAdditional guidance:\n';
            secondary.forEach(guide => {
                formatted += `• ${guide.content}\n`;
            });
        }
        
        return formatted.trim();
    }

    extractNextSteps(result) {
        const steps = [];
        
        if (result.csmGuidance) {
            result.csmGuidance.forEach(guidance => {
                if (guidance.nextSteps) {
                    steps.push(...guidance.nextSteps);
                }
            });
        }
        
        return steps;
    }
}

module.exports = GovWinCSMServer;

// If running directly, start the server
if (require.main === module) {
    const server = new GovWinCSMServer();
    server.start().catch(error => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });
}
