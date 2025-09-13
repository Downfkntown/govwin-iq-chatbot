const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

console.log('🔍 DEBUG: Starting server-integrated-railway-debug.js');
console.log('🔍 DEBUG: Express imported successfully');

// Import components - use the integrated coordinator
const { DatabaseConfig, AppConfig, RedisClient, Logger } = require('./lib/infrastructure');

console.log('🔍 DEBUG: Infrastructure components imported');

// Try to import the integrated coordinator, fall back to simple if not available
let CSMCoordinator;
try {
    console.log('🔍 DEBUG: Attempting to import integrated-csm-coordinator');
    CSMCoordinator = require('./lib/integrated-csm-coordinator');
    console.log('🔍 DEBUG: Successfully imported integrated-csm-coordinator');
} catch (error) {
    console.log('🔍 DEBUG: Failed to import integrated-csm-coordinator, using basic coordinator as fallback');
    console.log('🔍 DEBUG: Error:', error.message);
    CSMCoordinator = require('./lib/basic-csm-coordinator').BasicCSMCoordinator;
    console.log('🔍 DEBUG: Successfully imported basic-csm-coordinator');
}

class RailwayGovWinCSMServer {
    constructor() {
        console.log('🔍 DEBUG: RailwayGovWinCSMServer constructor called');
        
        this.app = express();
        console.log('🔍 DEBUG: Express app created');
        
        this.appConfig = new AppConfig();
        this.dbConfig = new DatabaseConfig();
        this.logger = new Logger('info');
        console.log('🔍 DEBUG: Config and logger instances created');
        
        this.redisClient = null;
        this.csmCoordinator = null;
        
        console.log('🔍 DEBUG: About to setup middleware');
        this.setupMiddleware();
        console.log('🔍 DEBUG: Middleware setup complete');
        
        console.log('🔍 DEBUG: About to setup routes');
        this.setupRoutes();
        console.log('🔍 DEBUG: Routes setup complete');
        
        console.log('🔍 DEBUG: About to setup error handling');
        this.setupErrorHandling();
        console.log('🔍 DEBUG: Error handling setup complete');
        
        console.log('🔍 DEBUG: RailwayGovWinCSMServer constructor finished');
    }

    setupMiddleware() {
        console.log('🔍 DEBUG: Setting up middleware...');
        
        this.app.use(helmet());
        console.log('🔍 DEBUG: Helmet middleware added');
        
        this.app.use(cors({ origin: '*', credentials: true }));
        console.log('🔍 DEBUG: CORS middleware added');
        
        this.app.use(compression());
        console.log('🔍 DEBUG: Compression middleware added');
        
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        console.log('🔍 DEBUG: JSON and URL encoded middleware added');
        
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 100,
            message: { error: 'Too many requests, please try again later.' }
        });
        this.app.use('/api/', limiter);
        console.log('🔍 DEBUG: Rate limiter added for /api/ routes');
        
        this.app.use((req, res, next) => {
            console.log(`🔍 DEBUG: Incoming request - ${req.method} ${req.url}`);
            console.log(`🔍 DEBUG: Request headers:`, req.headers);
            next();
        });
        console.log('🔍 DEBUG: Request logging middleware added');
        
        console.log('🔍 DEBUG: All middleware setup complete');
    }

    setupRoutes() {
        console.log('🔍 DEBUG: ===== STARTING ROUTE SETUP =====');
        
        // Health endpoint
        console.log('🔍 DEBUG: About to register /api/v1/system/health route');
        try {
            this.app.get('/api/v1/system/health', (req, res) => {
                console.log('🔍 DEBUG: /api/v1/system/health handler called');
                console.log('🔍 DEBUG: Request method:', req.method);
                console.log('🔍 DEBUG: Request URL:', req.url);
                console.log('🔍 DEBUG: Request params:', req.params);
                console.log('🔍 DEBUG: Request query:', req.query);
                
                try {
                    const responseData = {
                        status: 'ok',
                        timestamp: new Date().toISOString(),
                        uptime: process.uptime(),
                        environment: process.env.NODE_ENV || 'development',
                        service: 'GovWin CSM - Railway Production',
                        version: '1.0.0'
                    };
                    console.log('🔍 DEBUG: Health response data prepared:', responseData);
                    
                    res.json(responseData);
                    console.log('🔍 DEBUG: Health response sent successfully');
                } catch (handlerError) {
                    console.error('🔍 DEBUG: Error in health handler:', handlerError);
                    res.status(500).json({ error: 'Health check failed', details: handlerError.message });
                }
            });
            console.log('🔍 DEBUG: ✅ /api/v1/system/health route registered successfully');
        } catch (routeError) {
            console.error('🔍 DEBUG: ❌ Failed to register /api/v1/system/health route:', routeError);
        }

        // Status endpoint
        console.log('🔍 DEBUG: About to register /api/v1/system/status route');
        try {
            this.app.get('/api/v1/system/status', (req, res) => {
                console.log('🔍 DEBUG: ===== STATUS ENDPOINT HANDLER CALLED =====');
                console.log('🔍 DEBUG: Request method:', req.method);
                console.log('🔍 DEBUG: Request URL:', req.url);
                console.log('🔍 DEBUG: Request originalUrl:', req.originalUrl);
                console.log('🔍 DEBUG: Request params:', req.params);
                console.log('🔍 DEBUG: Request query:', req.query);
                console.log('🔍 DEBUG: Request headers:', req.headers);
                console.log('🔍 DEBUG: Request body:', req.body);
                
                try {
                    console.log('🔍 DEBUG: Building status response...');
                    const responseData = {
                        service: 'GovWin CSM - Railway Production',
                        version: '1.0.0',
                        status: 'operational',
                        timestamp: new Date().toISOString(),
                        deployment: {
                            platform: 'railway',
                            environment: process.env.NODE_ENV || 'development',
                            port: process.env.PORT || 3000
                        }
                    };
                    console.log('🔍 DEBUG: Status response data prepared:', JSON.stringify(responseData, null, 2));
                    
                    console.log('🔍 DEBUG: About to send JSON response...');
                    res.json(responseData);
                    console.log('🔍 DEBUG: ✅ Status response sent successfully');
                } catch (handlerError) {
                    console.error('🔍 DEBUG: ❌ Error in status handler:', handlerError);
                    console.error('🔍 DEBUG: Handler error stack:', handlerError.stack);
                    res.status(500).json({ 
                        error: 'Status check failed', 
                        details: handlerError.message,
                        stack: handlerError.stack
                    });
                }
            });
            console.log('🔍 DEBUG: ✅ /api/v1/system/status route registered successfully');
        } catch (routeError) {
            console.error('🔍 DEBUG: ❌ Failed to register /api/v1/system/status route:', routeError);
            console.error('🔍 DEBUG: Route error stack:', routeError.stack);
        }

        // Chat message endpoint
        console.log('🔍 DEBUG: About to register /api/v1/chat/message route');
        try {
            this.app.post('/api/v1/chat/message', async (req, res) => {
                console.log('🔍 DEBUG: /api/v1/chat/message handler called');
                
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
                    console.error('🔍 DEBUG: Chat endpoint error:', error);
                    
                    res.status(500).json({
                        success: false,
                        message: "I'm experiencing high demand right now. Let me connect you with a Customer Success Manager who can provide immediate assistance.",
                        escalationSuggested: true
                    });
                }
            });
            console.log('🔍 DEBUG: ✅ /api/v1/chat/message route registered successfully');
        } catch (routeError) {
            console.error('🔍 DEBUG: ❌ Failed to register /api/v1/chat/message route:', routeError);
        }
        
        // Log all registered routes
        console.log('🔍 DEBUG: ===== LISTING ALL REGISTERED ROUTES =====');
        this.app._router.stack.forEach((middleware, index) => {
            if (middleware.route) {
                const methods = Object.keys(middleware.route.methods).join(',').toUpperCase();
                console.log(`🔍 DEBUG: Route ${index}: ${methods} ${middleware.route.path}`);
            } else if (middleware.name === 'router') {
                console.log(`🔍 DEBUG: Router middleware ${index}: ${middleware.regexp}`);
            } else {
                console.log(`🔍 DEBUG: Middleware ${index}: ${middleware.name || 'anonymous'}`);
            }
        });
        
        console.log('🔍 DEBUG: ===== ROUTE SETUP COMPLETE =====');
    }

    setupErrorHandling() {
        console.log('🔍 DEBUG: Setting up error handling...');
        
        this.app.use((error, req, res, next) => {
            console.error('🔍 DEBUG: ❌ Unhandled error caught:', error);
            console.error('🔍 DEBUG: Error stack:', error.stack);
            console.log('🔍 DEBUG: Request that caused error:', req.method, req.url);
            
            res.status(500).json({
                error: 'Internal server error',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
                debug: {
                    url: req.url,
                    method: req.method,
                    timestamp: new Date().toISOString()
                }
            });
        });
        
        console.log('🔍 DEBUG: Error handling setup complete');
    }

    async initialize() {
        try {
            console.log('🔍 DEBUG: ===== STARTING INITIALIZATION =====');
            console.log('🔍 DEBUG: Initializing Railway GovWin CSM Server...');
            
            // Try Redis connection with fallback
            try {
                console.log('🔍 DEBUG: Attempting Redis connection...');
                this.redisClient = new RedisClient(this.dbConfig.getRedisConfig());
                await this.redisClient.connect();
                console.log('🔍 DEBUG: ✅ Redis connected successfully');
            } catch (error) {
                console.log('🔍 DEBUG: Redis not available, using memory storage fallback');
                console.log('🔍 DEBUG: Redis error:', error.message);
                // Use mock Redis
                const MockRedisClient = require('./lib/mock-redis-client');
                this.redisClient = new MockRedisClient(this.dbConfig.getRedisConfig());
                await this.redisClient.connect();
                console.log('🔍 DEBUG: ✅ Mock Redis client connected');
            }
            
            // Initialize CSM coordinator
            console.log('🔍 DEBUG: Initializing CSM coordinator...');
            this.csmCoordinator = new CSMCoordinator(
                this.redisClient,
                this.logger,
                this.appConfig.getAll()
            );
            console.log('🔍 DEBUG: ✅ CSM coordinator initialized');
            
            console.log('🔍 DEBUG: ✅ Railway server initialized successfully');
            console.log('🔍 DEBUG: ===== INITIALIZATION COMPLETE =====');
            
        } catch (error) {
            console.error('🔍 DEBUG: ❌ Failed to initialize Railway server:', error);
            console.error('🔍 DEBUG: Initialization error stack:', error.stack);
            throw error;
        }
    }

    async start() {
        console.log('🔍 DEBUG: ===== STARTING SERVER =====');
        
        await this.initialize();
        
        const port = process.env.PORT || 3000;
        console.log('🔍 DEBUG: Server will listen on port:', port);
        
        this.server = this.app.listen(port, '0.0.0.0', () => {
            console.log('🔍 DEBUG: ✅ Server is now listening!');
            console.log(`🔍 DEBUG: Railway GovWin CSM Server running on port ${port}`);
            console.log(`🔍 DEBUG: Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('🔍 DEBUG: Platform: Railway');
            console.log('🔍 DEBUG: Server address:', this.server.address());
            
            // Test route accessibility
            console.log('🔍 DEBUG: ===== TESTING ROUTE ACCESSIBILITY =====');
            console.log('🔍 DEBUG: Health endpoint should be available at: http://0.0.0.0:' + port + '/api/v1/system/health');
            console.log('🔍 DEBUG: Status endpoint should be available at: http://0.0.0.0:' + port + '/api/v1/system/status');
        });

        process.on('SIGTERM', () => {
            console.log('🔍 DEBUG: Received SIGTERM signal');
            this.shutdown();
        });
        process.on('SIGINT', () => {
            console.log('🔍 DEBUG: Received SIGINT signal');
            this.shutdown();
        });
        
        return this.server;
    }

    async shutdown() {
        console.log('🔍 DEBUG: ===== STARTING SHUTDOWN =====');
        console.log('🔍 DEBUG: Shutting down Railway server...');
        
        if (this.server) {
            console.log('🔍 DEBUG: Closing HTTP server...');
            this.server.close();
            console.log('🔍 DEBUG: ✅ HTTP server closed');
        }
        
        if (this.redisClient) {
            console.log('🔍 DEBUG: Disconnecting Redis client...');
            await this.redisClient.disconnect();
            console.log('🔍 DEBUG: ✅ Redis client disconnected');
        }
        
        console.log('🔍 DEBUG: ✅ Railway server shutdown complete');
        console.log('🔍 DEBUG: ===== SHUTDOWN COMPLETE =====');
        process.exit(0);
    }

    formatMessageForUI(result) {
        console.log('🔍 DEBUG: formatMessageForUI called');
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
        console.log('🔍 DEBUG: extractNextSteps called');
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

console.log('🔍 DEBUG: About to check if this is the main module');
if (require.main === module) {
    console.log('🔍 DEBUG: This is the main module, starting server...');
    const server = new RailwayGovWinCSMServer();
    server.start().catch(error => {
        console.error('🔍 DEBUG: ❌ Failed to start Railway server:', error);
        console.error('🔍 DEBUG: Startup error stack:', error.stack);
        process.exit(1);
    });
} else {
    console.log('🔍 DEBUG: This module is being required, not starting server directly');
}

console.log('🔍 DEBUG: About to export RailwayGovWinCSMServer class');
module.exports = RailwayGovWinCSMServer;
console.log('🔍 DEBUG: Module export complete');