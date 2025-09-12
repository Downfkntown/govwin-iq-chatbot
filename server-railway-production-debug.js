const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

console.log('🚂 RAILWAY DEBUG: Starting Railway Production Debug Server');
console.log('🚂 RAILWAY DEBUG: NODE_ENV:', process.env.NODE_ENV);
console.log('🚂 RAILWAY DEBUG: PORT:', process.env.PORT);
console.log('🚂 RAILWAY DEBUG: HOST:', process.env.HOST);
console.log('🚂 RAILWAY DEBUG: TRUST_PROXY:', process.env.TRUST_PROXY);
console.log('🚂 RAILWAY DEBUG: All ENV variables:', Object.keys(process.env).filter(key => 
    key.includes('RAILWAY') || key.includes('PORT') || key.includes('HOST') || key.includes('NODE') || key.includes('TRUST')
).reduce((obj, key) => ({ ...obj, [key]: process.env[key] }), {}));

// Import components - use the integrated coordinator
const { DatabaseConfig, AppConfig, RedisClient, Logger } = require('./lib/infrastructure');

console.log('🚂 RAILWAY DEBUG: Infrastructure components imported');

// Try to import the integrated coordinator, fall back to simple if not available
let CSMCoordinator;
try {
    console.log('🚂 RAILWAY DEBUG: Attempting to import integrated-csm-coordinator');
    CSMCoordinator = require('./lib/integrated-csm-coordinator');
    console.log('🚂 RAILWAY DEBUG: Successfully imported integrated-csm-coordinator');
} catch (error) {
    console.log('🚂 RAILWAY DEBUG: Failed to import integrated-csm-coordinator, using basic coordinator as fallback');
    console.log('🚂 RAILWAY DEBUG: Error:', error.message);
    CSMCoordinator = require('./lib/basic-csm-coordinator').BasicCSMCoordinator;
    console.log('🚂 RAILWAY DEBUG: Successfully imported basic-csm-coordinator');
}

class RailwayProductionServer {
    constructor() {
        console.log('🚂 RAILWAY DEBUG: RailwayProductionServer constructor called');
        
        this.app = express();
        console.log('🚂 RAILWAY DEBUG: Express app created');
        
        // Railway-specific trust proxy configuration
        if (process.env.TRUST_PROXY === 'true') {
            console.log('🚂 RAILWAY DEBUG: Enabling trust proxy for Railway');
            this.app.set('trust proxy', true);
        }
        
        this.appConfig = new AppConfig();
        this.dbConfig = new DatabaseConfig();
        this.logger = new Logger('info');
        console.log('🚂 RAILWAY DEBUG: Config and logger instances created');
        
        this.redisClient = null;
        this.csmCoordinator = null;
        
        // Railway-specific environment validation
        this.validateRailwayEnvironment();
        
        console.log('🚂 RAILWAY DEBUG: About to setup middleware');
        this.setupMiddleware();
        console.log('🚂 RAILWAY DEBUG: Middleware setup complete');
        
        console.log('🚂 RAILWAY DEBUG: About to setup routes');
        this.setupRoutes();
        console.log('🚂 RAILWAY DEBUG: Routes setup complete');
        
        console.log('🚂 RAILWAY DEBUG: About to setup error handling');
        this.setupErrorHandling();
        console.log('🚂 RAILWAY DEBUG: Error handling setup complete');
        
        console.log('🚂 RAILWAY DEBUG: RailwayProductionServer constructor finished');
    }

    validateRailwayEnvironment() {
        console.log('🚂 RAILWAY DEBUG: ===== VALIDATING RAILWAY ENVIRONMENT =====');
        
        const requiredEnvVars = ['PORT'];
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        
        if (missingVars.length > 0) {
            console.error('🚂 RAILWAY DEBUG: ❌ Missing required environment variables:', missingVars);
            console.error('🚂 RAILWAY DEBUG: This might cause Railway deployment failures');
        } else {
            console.log('🚂 RAILWAY DEBUG: ✅ All required environment variables present');
        }
        
        // Railway-specific checks
        const railwayVars = Object.keys(process.env).filter(key => key.startsWith('RAILWAY_'));
        console.log('🚂 RAILWAY DEBUG: Railway environment variables found:', railwayVars);
        
        // Port validation
        const port = process.env.PORT;
        if (port && (isNaN(port) || port < 1 || port > 65535)) {
            console.error('🚂 RAILWAY DEBUG: ❌ Invalid PORT value:', port);
        } else {
            console.log('🚂 RAILWAY DEBUG: ✅ PORT validation passed:', port);
        }
        
        // Host binding check
        const host = process.env.HOST || '0.0.0.0';
        console.log('🚂 RAILWAY DEBUG: Host binding will use:', host);
        if (host !== '0.0.0.0' && host !== '::') {
            console.warn('🚂 RAILWAY DEBUG: ⚠️ Host binding may cause issues on Railway. Recommended: 0.0.0.0');
        }
        
        console.log('🚂 RAILWAY DEBUG: ===== ENVIRONMENT VALIDATION COMPLETE =====');
    }

    setupMiddleware() {
        console.log('🚂 RAILWAY DEBUG: Setting up Railway-compatible middleware...');
        
        // Railway health check middleware - must be first
        this.app.use((req, res, next) => {
            console.log(`🚂 RAILWAY DEBUG: Incoming request - ${req.method} ${req.url}`);
            console.log(`🚂 RAILWAY DEBUG: Request IP: ${req.ip}`);
            console.log(`🚂 RAILWAY DEBUG: X-Forwarded-For: ${req.get('X-Forwarded-For')}`);
            console.log(`🚂 RAILWAY DEBUG: X-Forwarded-Proto: ${req.get('X-Forwarded-Proto')}`);
            console.log(`🚂 RAILWAY DEBUG: User-Agent: ${req.get('User-Agent')}`);
            
            // Check for Railway health check
            if (req.get('User-Agent')?.includes('Railway')) {
                console.log('🚂 RAILWAY DEBUG: Railway health check detected');
            }
            
            next();
        });
        
        this.app.use(helmet({
            // Railway-compatible helmet configuration
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https:"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                },
            },
        }));
        console.log('🚂 RAILWAY DEBUG: Helmet middleware added with Railway-compatible config');
        
        this.app.use(cors({ 
            origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*', 
            credentials: process.env.CORS_CREDENTIALS === 'true' 
        }));
        console.log('🚂 RAILWAY DEBUG: CORS middleware added');
        
        this.app.use(compression());
        console.log('🚂 RAILWAY DEBUG: Compression middleware added');
        
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        console.log('🚂 RAILWAY DEBUG: JSON and URL encoded middleware added');
        
        // Railway-compatible rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: process.env.API_RATE_LIMIT_MAX || 100,
            message: { error: 'Too many requests, please try again later.' },
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.app.use('/api/', limiter);
        console.log('🚂 RAILWAY DEBUG: Rate limiter added for /api/ routes');
        
        console.log('🚂 RAILWAY DEBUG: All middleware setup complete');
    }

    setupRoutes() {
        console.log('🚂 RAILWAY DEBUG: ===== STARTING RAILWAY ROUTE SETUP =====');
        
        // Railway root health check (sometimes Railway checks root)
        console.log('🚂 RAILWAY DEBUG: Setting up Railway root health check');
        this.app.get('/', (req, res) => {
            console.log('🚂 RAILWAY DEBUG: Root route accessed - likely Railway health check');
            res.json({
                service: 'GovWin CSM Railway',
                status: 'healthy',
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'production'
            });
        });
        
        // Primary health endpoint - Railway expects this
        console.log('🚂 RAILWAY DEBUG: About to register /api/v1/system/health route');
        try {
            this.app.get('/api/v1/system/health', (req, res) => {
                console.log('🚂 RAILWAY DEBUG: ===== HEALTH ENDPOINT HANDLER CALLED =====');
                console.log('🚂 RAILWAY DEBUG: Railway health check request details:');
                console.log('🚂 RAILWAY DEBUG: Request method:', req.method);
                console.log('🚂 RAILWAY DEBUG: Request URL:', req.url);
                console.log('🚂 RAILWAY DEBUG: Request headers:', req.headers);
                
                try {
                    const healthData = {
                        status: 'ok',
                        timestamp: new Date().toISOString(),
                        uptime: process.uptime(),
                        environment: process.env.NODE_ENV || 'production',
                        service: 'GovWin CSM - Railway Production',
                        version: '1.0.0',
                        railway: {
                            deployment: true,
                            platform: 'railway',
                            port: process.env.PORT,
                            host: process.env.HOST || '0.0.0.0'
                        }
                    };
                    
                    console.log('🚂 RAILWAY DEBUG: Health response prepared:', JSON.stringify(healthData, null, 2));
                    
                    // Set explicit headers for Railway
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Cache-Control', 'no-cache');
                    
                    res.status(200).json(healthData);
                    console.log('🚂 RAILWAY DEBUG: ✅ Health response sent successfully');
                } catch (handlerError) {
                    console.error('🚂 RAILWAY DEBUG: ❌ Error in health handler:', handlerError);
                    res.status(500).json({ 
                        error: 'Health check failed', 
                        details: handlerError.message,
                        railway: true
                    });
                }
            });
            console.log('🚂 RAILWAY DEBUG: ✅ /api/v1/system/health route registered successfully');
        } catch (routeError) {
            console.error('🚂 RAILWAY DEBUG: ❌ Failed to register /api/v1/system/health route:', routeError);
        }

        // Status endpoint with Railway-specific debugging
        console.log('🚂 RAILWAY DEBUG: About to register /api/v1/system/status route');
        try {
            this.app.get('/api/v1/system/status', (req, res) => {
                console.log('🚂 RAILWAY DEBUG: ===== STATUS ENDPOINT HANDLER CALLED =====');
                console.log('🚂 RAILWAY DEBUG: Railway status request details:');
                console.log('🚂 RAILWAY DEBUG: Request method:', req.method);
                console.log('🚂 RAILWAY DEBUG: Request URL:', req.url);
                console.log('🚂 RAILWAY DEBUG: Request originalUrl:', req.originalUrl);
                console.log('🚂 RAILWAY DEBUG: Request baseUrl:', req.baseUrl);
                console.log('🚂 RAILWAY DEBUG: Request path:', req.path);
                console.log('🚂 RAILWAY DEBUG: Request params:', req.params);
                console.log('🚂 RAILWAY DEBUG: Request query:', req.query);
                console.log('🚂 RAILWAY DEBUG: Request headers:', req.headers);
                console.log('🚂 RAILWAY DEBUG: Request IP:', req.ip);
                console.log('🚂 RAILWAY DEBUG: Request protocol:', req.protocol);
                console.log('🚂 RAILWAY DEBUG: Request secure:', req.secure);
                
                try {
                    console.log('🚂 RAILWAY DEBUG: Building Railway status response...');
                    
                    const statusData = {
                        service: 'GovWin CSM - Railway Production',
                        version: '1.0.0',
                        status: 'operational',
                        timestamp: new Date().toISOString(),
                        deployment: {
                            platform: 'railway',
                            environment: process.env.NODE_ENV || 'production',
                            port: process.env.PORT || 3000,
                            host: process.env.HOST || '0.0.0.0',
                            trustProxy: process.env.TRUST_PROXY === 'true'
                        },
                        request: {
                            ip: req.ip,
                            protocol: req.protocol,
                            secure: req.secure,
                            forwarded: {
                                for: req.get('X-Forwarded-For'),
                                proto: req.get('X-Forwarded-Proto'),
                                host: req.get('X-Forwarded-Host')
                            }
                        },
                        railway: {
                            healthcheckPath: '/api/v1/system/health',
                            deploymentId: process.env.RAILWAY_DEPLOYMENT_ID,
                            serviceId: process.env.RAILWAY_SERVICE_ID,
                            environmentId: process.env.RAILWAY_ENVIRONMENT_ID
                        }
                    };
                    
                    console.log('🚂 RAILWAY DEBUG: Status response data prepared:', JSON.stringify(statusData, null, 2));
                    
                    // Set explicit headers for Railway compatibility
                    res.setHeader('Content-Type', 'application/json; charset=utf-8');
                    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                    res.setHeader('Pragma', 'no-cache');
                    res.setHeader('Expires', '0');
                    
                    console.log('🚂 RAILWAY DEBUG: About to send Railway status response...');
                    res.status(200).json(statusData);
                    console.log('🚂 RAILWAY DEBUG: ✅ Railway status response sent successfully');
                    
                } catch (handlerError) {
                    console.error('🚂 RAILWAY DEBUG: ❌ Error in Railway status handler:', handlerError);
                    console.error('🚂 RAILWAY DEBUG: Handler error stack:', handlerError.stack);
                    res.status(500).json({ 
                        error: 'Railway status check failed', 
                        details: handlerError.message,
                        stack: process.env.NODE_ENV === 'development' ? handlerError.stack : undefined,
                        railway: true,
                        timestamp: new Date().toISOString()
                    });
                }
            });
            console.log('🚂 RAILWAY DEBUG: ✅ /api/v1/system/status route registered successfully');
        } catch (routeError) {
            console.error('🚂 RAILWAY DEBUG: ❌ Failed to register /api/v1/system/status route:', routeError);
            console.error('🚂 RAILWAY DEBUG: Route error stack:', routeError.stack);
        }

        // Chat message endpoint (minimal for testing)
        console.log('🚂 RAILWAY DEBUG: Setting up minimal chat endpoint for Railway testing');
        this.app.post('/api/v1/chat/message', (req, res) => {
            console.log('🚂 RAILWAY DEBUG: Chat endpoint accessed on Railway');
            res.json({
                success: true,
                message: "Railway deployment is working. Chat functionality initializing...",
                railway: true,
                timestamp: new Date().toISOString()
            });
        });
        
        // Catch-all for debugging missing routes
        this.app.use('*', (req, res) => {
            console.log('🚂 RAILWAY DEBUG: ❌ Route not found on Railway:', req.method, req.originalUrl);
            console.log('🚂 RAILWAY DEBUG: Available routes should be:');
            console.log('🚂 RAILWAY DEBUG: - GET /');
            console.log('🚂 RAILWAY DEBUG: - GET /api/v1/system/health');
            console.log('🚂 RAILWAY DEBUG: - GET /api/v1/system/status');
            console.log('🚂 RAILWAY DEBUG: - POST /api/v1/chat/message');
            
            res.status(404).json({
                error: 'Route not found',
                requestedPath: req.originalUrl,
                method: req.method,
                railway: true,
                availableRoutes: [
                    'GET /',
                    'GET /api/v1/system/health',
                    'GET /api/v1/system/status',
                    'POST /api/v1/chat/message'
                ]
            });
        });
        
        console.log('🚂 RAILWAY DEBUG: ===== RAILWAY ROUTE SETUP COMPLETE =====');
    }

    setupErrorHandling() {
        console.log('🚂 RAILWAY DEBUG: Setting up Railway-compatible error handling...');
        
        this.app.use((error, req, res, next) => {
            console.error('🚂 RAILWAY DEBUG: ❌ Unhandled error on Railway:', error);
            console.error('🚂 RAILWAY DEBUG: Error stack:', error.stack);
            console.log('🚂 RAILWAY DEBUG: Request that caused error:', req.method, req.url);
            console.log('🚂 RAILWAY DEBUG: Request headers:', req.headers);
            
            res.status(500).json({
                error: 'Internal server error',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
                railway: {
                    platform: true,
                    environment: process.env.NODE_ENV || 'production',
                    timestamp: new Date().toISOString()
                },
                debug: {
                    url: req.url,
                    method: req.method,
                    userAgent: req.get('User-Agent'),
                    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
                }
            });
        });
        
        console.log('🚂 RAILWAY DEBUG: Railway-compatible error handling setup complete');
    }

    async start() {
        console.log('🚂 RAILWAY DEBUG: ===== STARTING RAILWAY SERVER =====');
        
        // Railway-specific port and host configuration
        const port = process.env.PORT || 3000;
        const host = process.env.HOST || '0.0.0.0';
        
        console.log('🚂 RAILWAY DEBUG: Railway server configuration:');
        console.log('🚂 RAILWAY DEBUG: - Port:', port);
        console.log('🚂 RAILWAY DEBUG: - Host:', host);
        console.log('🚂 RAILWAY DEBUG: - NODE_ENV:', process.env.NODE_ENV);
        console.log('🚂 RAILWAY DEBUG: - Trust Proxy:', process.env.TRUST_PROXY);
        
        return new Promise((resolve, reject) => {
            try {
                this.server = this.app.listen(port, host, () => {
                    console.log('🚂 RAILWAY DEBUG: ✅ Railway server is now listening!');
                    console.log(`🚂 RAILWAY DEBUG: Railway GovWin CSM Server running on ${host}:${port}`);
                    console.log(`🚂 RAILWAY DEBUG: Environment: ${process.env.NODE_ENV || 'production'}`);
                    console.log('🚂 RAILWAY DEBUG: Platform: Railway');
                    console.log('🚂 RAILWAY DEBUG: Server address info:', this.server.address());
                    
                    // Railway deployment verification
                    console.log('🚂 RAILWAY DEBUG: ===== RAILWAY DEPLOYMENT VERIFICATION =====');
                    console.log('🚂 RAILWAY DEBUG: Health endpoint: http://' + host + ':' + port + '/api/v1/system/health');
                    console.log('🚂 RAILWAY DEBUG: Status endpoint: http://' + host + ':' + port + '/api/v1/system/status');
                    console.log('🚂 RAILWAY DEBUG: Root endpoint: http://' + host + ':' + port + '/');
                    
                    resolve(this.server);
                });
                
                this.server.on('error', (error) => {
                    console.error('🚂 RAILWAY DEBUG: ❌ Server error:', error);
                    if (error.code === 'EADDRINUSE') {
                        console.error('🚂 RAILWAY DEBUG: ❌ Port', port, 'is already in use on Railway');
                    } else if (error.code === 'EACCES') {
                        console.error('🚂 RAILWAY DEBUG: ❌ Permission denied to bind to port', port, 'on Railway');
                    }
                    reject(error);
                });
                
            } catch (startupError) {
                console.error('🚂 RAILWAY DEBUG: ❌ Failed to start Railway server:', startupError);
                reject(startupError);
            }
        });
    }
}

console.log('🚂 RAILWAY DEBUG: About to check if this is the main module');
if (require.main === module) {
    console.log('🚂 RAILWAY DEBUG: This is the main module, starting Railway server...');
    const server = new RailwayProductionServer();
    server.start().catch(error => {
        console.error('🚂 RAILWAY DEBUG: ❌ Failed to start Railway server:', error);
        console.error('🚂 RAILWAY DEBUG: Startup error stack:', error.stack);
        process.exit(1);
    });
} else {
    console.log('🚂 RAILWAY DEBUG: This module is being required, not starting server directly');
}

console.log('🚂 RAILWAY DEBUG: About to export RailwayProductionServer class');
module.exports = RailwayProductionServer;
console.log('🚂 RAILWAY DEBUG: Railway module export complete');# Force Railway redeploy Fri, Sep 12, 2025  5:30:29 PM
