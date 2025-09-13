const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import components
const { DatabaseConfig, AppConfig, RedisClient, Logger } = require('./lib/infrastructure');
const IntegratedCSMCoordinator = require('./lib/integrated-csm-coordinator');

class IntegratedGovWinCSMServer {
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
        this.app.use(helmet());
        this.app.use(cors({
            origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
            credentials: true
        }));
        this.app.use(compression());
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        
        const limiter = rateLimit({
            windowMs: this.appConfig.get('rateLimiting').windowMs,
            max: this.appConfig.get('rateLimiting').max,
            message: {
                error: 'Too many requests from this IP, please try again later.'
            }
        });
        this.app.use('/api/', limiter);
        
        this.app.use((req, res, next) => {
            this.logger.info('Request received', {
                method: req.method,
                url: req.url,
                ip: req.ip
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
                
                res.json({
                    status: 'ok',
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    redis: redisHealth,
                    csm: csmMetrics ? {
                        totalQueries: csmMetrics.totalQueries,
                        successRate: csmMetrics.totalQueries > 0 ? 
                            (csmMetrics.successfulQueries / csmMetrics.totalQueries * 100).toFixed(2) : 0,
                        averageLatency: Math.round(csmMetrics.averageLatency),
                        activeConversations: csmMetrics.activeConversations,
                        existingAgents: csmMetrics.existingAgents
                    } : { status: 'not_initialized' }
                });
            } catch (error) {
                res.status(500).json({
                    status: 'error',
                    error: error.message
                });
            }
        });

        // Main chat endpoint with existing agent integration
        this.app.post('/api/v1/chat/message', async (req, res) => {
            try {
                const { message, userId, sessionId } = req.body;
                
                if (!message || typeof message !== 'string' || message.trim().length === 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'Message is required and must be a non-empty string'
                    });
                }
                
                const finalUserId = userId || sessionId || `anonymous_${Date.now()}`;
                
                // Process through integrated CSM system
                const result = await this.csmCoordinator.processQuery(
                    message.trim(),
                    finalUserId,
                    { 
                        userAgent: req.get('User-Agent'),
                        ip: req.ip
                    }
                );
                
                const response = {
                    success: true,
                    queryId: result.queryId,
                    message: this.formatMessageForUI(result),
                    guidance: result.csmGuidance,
                    nextSteps: this.extractNextSteps(result),
                    escalationSuggested: result.escalationSuggested || false,
                    fromCache: result.fromCache || false,
                    timestamp: result.timestamp,
                    agentUsed: result.analysis?.targetAgent || 'auto-detected'
                };
                
                this.logger.info('Integrated chat response sent', { 
                    queryId: result.queryId,
                    userId: finalUserId,
                    agentUsed: result.analysis?.targetAgent
                });
                
                res.json(response);
                
            } catch (error) {
                this.logger.error('Integrated chat endpoint error', { 
                    error: error.message
                });
                
                res.status(500).json({
                    success: false,
                    message: "I'm experiencing high demand right now. Let me connect you with a Customer Success Manager who can provide immediate assistance.",
                    escalationSuggested: true
                });
            }
        });

        // System status with agent information
        this.app.get('/api/v1/system/status', async (req, res) => {
            try {
                const metrics = this.csmCoordinator ? await this.csmCoordinator.getMetrics() : null;
                
                res.json({
                    service: 'GovWin CSM - Integrated',
                    version: '1.0.0',
                    status: this.csmCoordinator ? 'operational' : 'initializing',
                    timestamp: new Date().toISOString(),
                    metrics: metrics,
                    integration: {
                        existingAgentsLoaded: metrics?.existingAgents || [],
                        bridgeStatus: 'operational'
                    }
                });
            } catch (error) {
                res.status(500).json({
                    service: 'GovWin CSM - Integrated',
                    status: 'error',
                    error: error.message
                });
            }
        });

        // Other endpoints same as before...
        this.app.get('/api/v1/chat/history/:userId', async (req, res) => {
            try {
                const { userId } = req.params;
                const history = await this.csmCoordinator.conversationManager.getConversationHistory(userId);
                
                res.json({
                    success: true,
                    userId,
                    history,
                    count: history.length
                });
                
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Failed to retrieve conversation history'
                });
            }
        });
    }

    setupErrorHandling() {
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Route not found',
                path: req.originalUrl
            });
        });

        this.app.use((error, req, res, next) => {
            this.logger.error('Unhandled error', {
                error: error.message,
                url: req.url
            });

            res.status(500).json({
                error: 'Internal server error'
            });
        });
    }

    async initialize() {
        try {
            this.logger.info('Initializing Integrated GovWin CSM Server...');
            
            this.redisClient = new RedisClient(this.dbConfig.getRedisConfig());
            await this.redisClient.connect();
            
            // Initialize with integrated coordinator
            this.csmCoordinator = new IntegratedCSMCoordinator(
                this.redisClient,
                this.logger,
                this.appConfig.getAll()
            );
            
            this.logger.info('Integrated server initialized successfully');
            
        } catch (error) {
            this.logger.error('Failed to initialize integrated server', { error: error.message });
            throw error;
        }
    }

    async start() {
        await this.initialize();
        
        const port = this.appConfig.get('port');
        
        this.server = this.app.listen(port, () => {
            this.logger.info(`Integrated GovWin CSM Server running on port ${port}`, {
                environment: this.appConfig.get('env'),
                port
            });
        });

        process.on('SIGTERM', () => this.shutdown());
        process.on('SIGINT', () => this.shutdown());
        
        return this.server;
    }

    async shutdown() {
        this.logger.info('Shutting down integrated server...');
        
        if (this.server) {
            this.server.close();
        }
        
        if (this.redisClient) {
            await this.redisClient.disconnect();
        }
        
        this.logger.info('Integrated server shutdown complete');
        process.exit(0);
    }

    formatMessageForUI(result) {
        if (!result.csmGuidance || result.csmGuidance.length === 0) {
            return "I'm here to help you navigate GovWin IQ. What can I assist you with today?";
        }
        
        if (result.csmGuidance.length === 1) {
            return result.csmGuidance[0].content;
        }
        
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

module.exports = IntegratedGovWinCSMServer;

if (require.main === module) {
    const server = new IntegratedGovWinCSMServer();
    server.start().catch(error => {
        console.error('Failed to start integrated server:', error);
        process.exit(1);
    });
}
