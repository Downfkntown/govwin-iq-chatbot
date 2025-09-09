/**
 * API Configuration for GovWin IQ Chatbot
 * REST API settings, endpoints, and middleware configuration
 */

const apiConfig = {
    version: '1.0.0',
    lastUpdated: '2025-09-09',

    // API Server Configuration
    server: {
        host: process.env.API_HOST || '0.0.0.0',
        port: process.env.API_PORT || 3000,
        protocol: process.env.API_PROTOCOL || 'http',
        basePath: '/api/v1',
        requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000,
        keepAliveTimeout: parseInt(process.env.KEEP_ALIVE_TIMEOUT) || 65000,
        headersTimeout: parseInt(process.env.HEADERS_TIMEOUT) || 66000,
        maxRequestSize: process.env.MAX_REQUEST_SIZE || '10mb',
        compression: {
            enabled: true,
            level: 6,
            threshold: 1024
        }
    },

    // CORS Configuration
    cors: {
        enabled: true,
        origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['*'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-API-Key',
            'X-Request-ID',
            'X-Client-Version',
            'Accept',
            'User-Agent'
        ],
        exposedHeaders: [
            'X-Response-Time',
            'X-Request-ID',
            'X-Rate-Limit-Remaining',
            'X-Rate-Limit-Reset'
        ],
        credentials: true,
        maxAge: 86400
    },

    // Security Middleware
    security: {
        helmet: {
            enabled: true,
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'", "https://api.govwin.com"]
                }
            },
            hsts: {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true
            }
        },
        rateLimiting: {
            enabled: true,
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            skipSuccessfulRequests: false,
            skipFailedRequests: false,
            keyGenerator: (req) => req.ip,
            handler: (req, res) => {
                res.status(429).json({
                    error: 'Too Many Requests',
                    message: 'Rate limit exceeded. Please try again later.',
                    retryAfter: Math.round(req.rateLimit.resetTime / 1000)
                });
            }
        },
        authentication: {
            enabled: true,
            strategies: ['jwt', 'api-key'],
            jwt: {
                secret: process.env.JWT_SECRET,
                expiresIn: process.env.JWT_EXPIRES_IN || '24h',
                algorithm: 'HS256',
                issuer: 'govwin-iq-chatbot',
                audience: 'govwin-iq-users'
            },
            apiKey: {
                header: 'X-API-Key',
                queryParam: 'api_key',
                required: false
            }
        },
        inputValidation: {
            enabled: true,
            stripUnknown: true,
            abortEarly: false,
            allowUnknown: false
        }
    },

    // API Endpoints Configuration
    endpoints: {
        // Chatbot conversation endpoints
        chat: {
            base: '/chat',
            routes: {
                message: {
                    path: '/message',
                    method: 'POST',
                    auth: true,
                    rateLimit: {
                        windowMs: 60000,
                        max: 30
                    },
                    validation: {
                        body: {
                            message: { type: 'string', required: true, max: 2000 },
                            sessionId: { type: 'string', required: true },
                            userId: { type: 'string', required: false },
                            context: { type: 'object', required: false }
                        }
                    },
                    response: {
                        200: {
                            message: 'string',
                            intent: 'string',
                            confidence: 'number',
                            suggestions: 'array',
                            sessionId: 'string'
                        }
                    }
                },
                session: {
                    path: '/session',
                    method: 'POST',
                    auth: true,
                    validation: {
                        body: {
                            userId: { type: 'string', required: false },
                            platform: { type: 'string', required: true },
                            metadata: { type: 'object', required: false }
                        }
                    }
                },
                history: {
                    path: '/session/:sessionId/history',
                    method: 'GET',
                    auth: true,
                    validation: {
                        params: {
                            sessionId: { type: 'string', required: true }
                        },
                        query: {
                            limit: { type: 'number', default: 50, max: 100 },
                            offset: { type: 'number', default: 0 }
                        }
                    }
                }
            }
        },

        // GovWin IQ integration endpoints
        govwin: {
            base: '/govwin',
            routes: {
                search: {
                    path: '/search',
                    method: 'POST',
                    auth: true,
                    rateLimit: {
                        windowMs: 60000,
                        max: 20
                    },
                    validation: {
                        body: {
                            query: { type: 'string', required: true, max: 500 },
                            filters: { type: 'object', required: false },
                            limit: { type: 'number', default: 10, max: 50 }
                        }
                    }
                },
                opportunity: {
                    path: '/opportunity/:id',
                    method: 'GET',
                    auth: true,
                    validation: {
                        params: {
                            id: { type: 'string', required: true }
                        }
                    }
                },
                reports: {
                    path: '/reports',
                    method: 'GET',
                    auth: true,
                    validation: {
                        query: {
                            type: { type: 'string', enum: ['opportunity', 'vendor', 'agency'] },
                            dateRange: { type: 'string', enum: ['7d', '30d', '90d', '1y'] },
                            format: { type: 'string', enum: ['json', 'csv', 'pdf'], default: 'json' }
                        }
                    }
                }
            }
        },

        // User management endpoints
        users: {
            base: '/users',
            routes: {
                profile: {
                    path: '/profile',
                    method: 'GET',
                    auth: true
                },
                preferences: {
                    path: '/preferences',
                    method: ['GET', 'PUT'],
                    auth: true,
                    validation: {
                        body: {
                            notifications: { type: 'boolean', default: true },
                            language: { type: 'string', default: 'en-US' },
                            timezone: { type: 'string', required: false }
                        }
                    }
                },
                usage: {
                    path: '/usage',
                    method: 'GET',
                    auth: true,
                    validation: {
                        query: {
                            period: { type: 'string', enum: ['day', 'week', 'month'], default: 'week' }
                        }
                    }
                }
            }
        },

        // Analytics and monitoring endpoints
        analytics: {
            base: '/analytics',
            routes: {
                conversations: {
                    path: '/conversations',
                    method: 'GET',
                    auth: true,
                    adminOnly: true,
                    validation: {
                        query: {
                            startDate: { type: 'string', format: 'date' },
                            endDate: { type: 'string', format: 'date' },
                            groupBy: { type: 'string', enum: ['hour', 'day', 'week'] }
                        }
                    }
                },
                intents: {
                    path: '/intents',
                    method: 'GET',
                    auth: true,
                    adminOnly: true
                },
                satisfaction: {
                    path: '/satisfaction',
                    method: 'GET',
                    auth: true,
                    adminOnly: true
                }
            }
        },

        // System endpoints
        system: {
            base: '/system',
            routes: {
                health: {
                    path: '/health',
                    method: 'GET',
                    auth: false,
                    rateLimit: {
                        windowMs: 60000,
                        max: 100
                    }
                },
                ready: {
                    path: '/ready',
                    method: 'GET',
                    auth: false
                },
                metrics: {
                    path: '/metrics',
                    method: 'GET',
                    auth: false,
                    adminOnly: true
                },
                version: {
                    path: '/version',
                    method: 'GET',
                    auth: false
                }
            }
        }
    },

    // Middleware Configuration
    middleware: {
        // Request logging
        logging: {
            enabled: true,
            format: 'combined',
            includeHeaders: false,
            includeBody: false,
            skipPaths: ['/health', '/metrics'],
            sensitiveFields: ['password', 'token', 'apiKey', 'authorization']
        },

        // Request ID generation
        requestId: {
            enabled: true,
            header: 'X-Request-ID',
            generator: 'uuid4'
        },

        // Response time tracking
        responseTime: {
            enabled: true,
            header: 'X-Response-Time',
            digits: 3
        },

        // Error handling
        errorHandler: {
            enabled: true,
            includeStack: process.env.NODE_ENV === 'development',
            logErrors: true,
            customErrors: {
                ValidationError: {
                    statusCode: 400,
                    message: 'Invalid request data'
                },
                AuthenticationError: {
                    statusCode: 401,
                    message: 'Authentication required'
                },
                AuthorizationError: {
                    statusCode: 403,
                    message: 'Insufficient permissions'
                },
                NotFoundError: {
                    statusCode: 404,
                    message: 'Resource not found'
                },
                RateLimitError: {
                    statusCode: 429,
                    message: 'Rate limit exceeded'
                }
            }
        },

        // Request parsing
        bodyParser: {
            json: {
                enabled: true,
                limit: '10mb',
                strict: true
            },
            urlencoded: {
                enabled: true,
                extended: true,
                limit: '10mb'
            },
            text: {
                enabled: false,
                limit: '1mb'
            },
            raw: {
                enabled: false,
                limit: '1mb'
            }
        },

        // Static file serving
        static: {
            enabled: true,
            directory: 'public',
            maxAge: '1h',
            etag: true,
            lastModified: true,
            index: ['index.html']
        }
    },

    // Response Configuration
    responses: {
        // Default response headers
        defaultHeaders: {
            'X-Powered-By': 'GovWin IQ Chatbot',
            'X-API-Version': '1.0.0',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        },

        // Success response templates
        success: {
            format: 'json',
            includeMetadata: true,
            metadata: {
                timestamp: true,
                requestId: true,
                version: true,
                executionTime: true
            }
        },

        // Error response templates
        error: {
            format: 'json',
            includeDetails: process.env.NODE_ENV === 'development',
            includeStack: process.env.NODE_ENV === 'development',
            sanitizeMessages: true
        },

        // Pagination
        pagination: {
            defaultLimit: 20,
            maxLimit: 100,
            includeTotals: true,
            includePages: true
        }
    },

    // OpenAPI Documentation
    documentation: {
        enabled: true,
        path: '/docs',
        title: 'GovWin IQ Chatbot API',
        description: 'REST API for GovWin IQ Customer Success Chatbot',
        version: '1.0.0',
        contact: {
            name: 'API Support',
            email: 'api-support@govwin.com'
        },
        servers: [
            {
                url: 'http://localhost:3000/api/v1',
                description: 'Development server'
            },
            {
                url: 'https://api.govwin-chatbot.com/v1',
                description: 'Production server'
            }
        ],
        tags: [
            {
                name: 'Chat',
                description: 'Chatbot conversation endpoints'
            },
            {
                name: 'GovWin',
                description: 'GovWin IQ integration endpoints'
            },
            {
                name: 'Users',
                description: 'User management endpoints'
            },
            {
                name: 'Analytics',
                description: 'Analytics and reporting endpoints'
            },
            {
                name: 'System',
                description: 'System health and monitoring endpoints'
            }
        ]
    },

    // Testing Configuration
    testing: {
        mockApi: {
            enabled: process.env.NODE_ENV === 'test',
            delayMs: 100,
            errorRate: 0.05
        },
        fixtures: {
            path: './testing/fixtures',
            autoLoad: true
        }
    },

    // Performance Configuration
    performance: {
        clustering: {
            enabled: process.env.NODE_ENV === 'production',
            workers: process.env.CLUSTER_WORKERS || 'auto'
        },
        caching: {
            enabled: true,
            ttl: 300,
            prefix: 'api:',
            invalidateOnUpdate: true
        },
        connectionPooling: {
            enabled: true,
            maxConnections: 50,
            acquireTimeout: 60000,
            timeout: 30000
        }
    }
};

// Utility functions for API configuration
const apiUtils = {
    getEndpointConfig(group, route) {
        return apiConfig.endpoints[group]?.routes[route];
    },

    generateRoutes() {
        const routes = [];
        
        Object.entries(apiConfig.endpoints).forEach(([group, config]) => {
            Object.entries(config.routes).forEach(([routeName, routeConfig]) => {
                const methods = Array.isArray(routeConfig.method) 
                    ? routeConfig.method 
                    : [routeConfig.method];

                methods.forEach(method => {
                    routes.push({
                        group,
                        name: routeName,
                        method: method.toUpperCase(),
                        path: config.base + routeConfig.path,
                        auth: routeConfig.auth || false,
                        adminOnly: routeConfig.adminOnly || false,
                        rateLimit: routeConfig.rateLimit,
                        validation: routeConfig.validation
                    });
                });
            });
        });

        return routes;
    },

    validateEndpointAccess(endpoint, userRole) {
        if (endpoint.adminOnly && userRole !== 'admin') {
            return { allowed: false, reason: 'Admin access required' };
        }
        
        if (endpoint.auth && !userRole) {
            return { allowed: false, reason: 'Authentication required' };
        }

        return { allowed: true };
    },

    getOpenApiSpec() {
        const spec = {
            openapi: '3.0.3',
            info: {
                title: apiConfig.documentation.title,
                description: apiConfig.documentation.description,
                version: apiConfig.documentation.version,
                contact: apiConfig.documentation.contact
            },
            servers: apiConfig.documentation.servers,
            tags: apiConfig.documentation.tags,
            paths: {},
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    },
                    apiKey: {
                        type: 'apiKey',
                        in: 'header',
                        name: 'X-API-Key'
                    }
                }
            }
        };

        // Generate paths from endpoint configuration
        this.generateRoutes().forEach(route => {
            if (!spec.paths[route.path]) {
                spec.paths[route.path] = {};
            }
            
            spec.paths[route.path][route.method.toLowerCase()] = {
                tags: [route.group],
                summary: `${route.method} ${route.path}`,
                security: route.auth ? [{ bearerAuth: [] }] : [],
                responses: {
                    200: {
                        description: 'Successful response'
                    }
                }
            };
        });

        return spec;
    }
};

module.exports = {
    apiConfig,
    apiUtils,
    getEndpointConfig: apiUtils.getEndpointConfig.bind(apiUtils),
    generateRoutes: apiUtils.generateRoutes.bind(apiUtils),
    validateEndpointAccess: apiUtils.validateEndpointAccess.bind(apiUtils),
    getOpenApiSpec: apiUtils.getOpenApiSpec.bind(apiUtils)
};