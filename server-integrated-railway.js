const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import components - use the integrated coordinator
const { DatabaseConfig, AppConfig, RedisClient, Logger } = require('./lib/infrastructure');

// Try to import the integrated coordinator, fall back to simple if not available
let CSMCoordinator;
try {
    CSMCoordinator = require('./lib/integrated-csm-coordinator');
} catch (error) {
    console.log('Using basic coordinator as fallback');
    CSMCoordinator = require('./lib/basic-csm-coordinator').BasicCSMCoordinator;
}

class RailwayGovWinCSMServer {
    constructor() {
        this.app = express();
        this.appConfig = new AppConfig();
        this.dbConfig = new DatabaseConfig();
        this.logger = new Logger('info');
        this.redisClient = null;
        this.csmCoordinator = null;
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    setupMiddleware() {
        this.app.use(helmet());
        this.app.use(cors({ origin: '*', credentials: true }));
        this.app.use(compression());
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 100,
            message: { error: 'Too many requests, please try again later.' }
        });
        this.app.use('/api/', limiter);
        
        this.app.use((req, res, next) => {
            console.log(`${req.method} ${req.url}`);
            next();
        });
    }

    setupRoutes() {
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || 'development',
                service: 'GovWin CSM - Railway Production',
                version: '1.0.0'
            });
        });

        this.app.get('/api/v1/system/status', async (req, res) => {
            try {
                const metrics = this.csmCoordinator ? await this.csmCoordinator.getMetrics() : null;
                
                res.json({
                    service: 'GovWin CSM - Railway Production',
                    version: '1.0.0',
                    status: this.csmCoordinator ? 'operational' : 'initializing',
                    timestamp: new Date().toISOString(),
                    deployment: {
                        platform: 'railway',
                        environment: process.env.NODE_ENV || 'development',
                        port: process.env.PORT || 3000
                    },
                    metrics: metrics,
                    integration: {
                        existingAgentsLoaded: metrics?.existingAgents || [],
                        bridgeStatus: 'operational'
                    }
                });
            } catch (error) {
                res.status(500).json({
                    service: 'GovWin CSM - Railway Production',
                    status: 'error',
                    error: error.message
                });
            }
        });

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
                
                if (!this.csmCoordinator) {
                    return res.json({
                        success: true,
                        message: "I'm initializing the system. Please try again in a moment.",
                        escalationSuggested: true
                    });
                }
                
                const result = await this.csmCoordinator.processQuery(
                    message.trim(),
                    finalUserId,
                    { userAgent: req.get('User-Agent'), ip: req.ip }
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
                    agentUsed: result.analysis?.targetAgent || 'auto-detected',
                    deployment: 'railway',
                    availableAgents: result.availableAgents || []
                };
                
                res.json(response);
                
            } catch (error) {
                console.error('Chat endpoint error:', error);
                
                res.status(500).json({
                    success: false,
                    message: "I'm experiencing high demand right now. Let me connect you with a Customer Success Manager who can provide immediate assistance.",
                    escalationSuggested: true
                });
            }
        });
    }

    setupErrorHandling() {
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Route not found',
                path: req.originalUrl,
                availableEndpoints: [
                    'GET /health',
                    'GET /api/v1/system/status', 
                    'POST /api/v1/chat/message'
                ]
            });
        });

        this.app.use((error, req, res, next) => {
            console.error('Unhandled error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
            });
        });
    }

    async initialize() {
        try {
            console.log('Initializing Railway GovWin CSM Server...');
            
            // Try Redis connection with fallback
            try {
                this.redisClient = new RedisClient(this.dbConfig.getRedisConfig());
                await this.redisClient.connect();
                console.log('Redis connected successfully');
            } catch (error) {
                console.log('Redis not available, using memory storage fallback');
                // Use mock Redis
                const MockRedisClient = require('./lib/mock-redis-client');
                this.redisClient = new MockRedisClient(this.dbConfig.getRedisConfig());
                await this.redisClient.connect();
            }
            
            // Initialize CSM coordinator
            this.csmCoordinator = new CSMCoordinator(
                this.redisClient,
                this.logger,
                this.appConfig.getAll()
            );
            
            console.log('Railway server initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Railway server:', error);
            throw error;
        }
    }

    async start() {
        await this.initialize();
        
        const port = process.env.PORT || 3000;
        
        this.server = this.app.listen(port, '0.0.0.0', () => {
            console.log(`Railway GovWin CSM Server running on port ${port}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('Platform: Railway');
        });

        process.on('SIGTERM', () => this.shutdown());
        process.on('SIGINT', () => this.shutdown());
        
        return this.server;
    }

    async shutdown() {
        console.log('Shutting down Railway server...');
        
        if (this.server) {
            this.server.close();
        }
        
        if (this.redisClient) {
            await this.redisClient.disconnect();
        }
        
        console.log('Railway server shutdown complete');
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
        return primary ? primary.content : result.csmGuidance[0].content;
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

if (require.main === module) {
    const server = new RailwayGovWinCSMServer();
    server.start().catch(error => {
        console.error('Failed to start Railway server:', error);
        process.exit(1);
    });
}

module.exports = RailwayGovWinCSMServer;
