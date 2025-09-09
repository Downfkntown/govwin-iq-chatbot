/**
 * GovWin IQ Chatbot Server
 * Express.js server with API configuration and conversation flows
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { v4: uuidv4 } = require('uuid');

// Import configurations
const { apiConfig } = require('../config/api-config');
const { config: envConfig } = require('../config/environment');
const chatbotSettings = require('../config/chatbot-settings.json');
const chatbotParameters = require('../config/chatbot-parameters.json');

// Import conversation flows
const SearchAssistanceFlow = require('../conversation-flows/search-assistance');

// Initialize Express app
const app = express();

// Store active sessions
const activeSessions = new Map();
const conversationHistory = new Map();

// Initialize conversation flow handlers
const searchFlow = new SearchAssistanceFlow();

// Middleware Setup
// =================

// Security middleware
app.use(helmet(apiConfig.security.helmet));

// CORS configuration
app.use(cors({
    origin: apiConfig.cors.origin,
    methods: apiConfig.cors.methods,
    allowedHeaders: apiConfig.cors.allowedHeaders,
    exposedHeaders: apiConfig.cors.exposedHeaders,
    credentials: apiConfig.cors.credentials,
    maxAge: apiConfig.cors.maxAge
}));

// Compression middleware
if (apiConfig.server.compression.enabled) {
    app.use(compression({
        level: apiConfig.server.compression.level,
        threshold: apiConfig.server.compression.threshold
    }));
}

// Rate limiting
if (apiConfig.security.rateLimiting.enabled) {
    const limiter = rateLimit({
        windowMs: apiConfig.security.rateLimiting.windowMs,
        max: apiConfig.security.rateLimiting.max,
        skipSuccessfulRequests: apiConfig.security.rateLimiting.skipSuccessfulRequests,
        skipFailedRequests: apiConfig.security.rateLimiting.skipFailedRequests,
        keyGenerator: apiConfig.security.rateLimiting.keyGenerator,
        handler: apiConfig.security.rateLimiting.handler
    });
    app.use('/api/', limiter);
}

// Body parsing middleware
app.use(express.json({ 
    limit: apiConfig.middleware.bodyParser.json.limit,
    strict: apiConfig.middleware.bodyParser.json.strict
}));

app.use(express.urlencoded({ 
    extended: apiConfig.middleware.bodyParser.urlencoded.extended,
    limit: apiConfig.middleware.bodyParser.urlencoded.limit
}));

// Request ID middleware
app.use((req, res, next) => {
    req.id = req.headers['x-request-id'] || uuidv4();
    res.setHeader('X-Request-ID', req.id);
    next();
});

// Response time middleware
app.use((req, res, next) => {
    const startTime = Date.now();
    const originalSend = res.send;
    
    res.send = function(data) {
        const responseTime = Date.now() - startTime;
        res.setHeader('X-Response-Time', `${responseTime}ms`);
        return originalSend.call(this, data);
    };
    
    next();
});

// Logging middleware
if (apiConfig.middleware.logging.enabled) {
    app.use((req, res, next) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip} - ${req.id}`);
        next();
    });
}

// Default response headers
app.use((req, res, next) => {
    Object.entries(apiConfig.responses.defaultHeaders).forEach(([header, value]) => {
        res.setHeader(header, value);
    });
    next();
});

// Session Management
// ==================

function createSession(userId, platform, metadata = {}) {
    const sessionId = uuidv4();
    const session = {
        id: sessionId,
        userId,
        platform,
        metadata,
        createdAt: new Date(),
        lastActivity: new Date(),
        turnCount: 0,
        context: {
            currentFlow: null,
            flowState: {},
            entities: {},
            intent: null,
            confidence: 0
        }
    };
    
    activeSessions.set(sessionId, session);
    conversationHistory.set(sessionId, []);
    
    return session;
}

function getSession(sessionId) {
    return activeSessions.get(sessionId);
}

function updateSession(sessionId, updates) {
    const session = activeSessions.get(sessionId);
    if (session) {
        Object.assign(session, updates);
        session.lastActivity = new Date();
        activeSessions.set(sessionId, session);
    }
    return session;
}

// Intent Recognition
// ==================

function recognizeIntent(message) {
    const lowerMessage = message.toLowerCase();
    const intents = [
        { name: 'search_assistance', keywords: ['search', 'find', 'look for', 'opportunity', 'opportunities'], confidence: 0.8 },
        { name: 'navigation_help', keywords: ['navigate', 'navigation', 'help', 'guide', 'where'], confidence: 0.7 },
        { name: 'report_generation', keywords: ['report', 'generate', 'export', 'analytics', 'dashboard'], confidence: 0.7 },
        { name: 'greeting', keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'], confidence: 0.9 },
        { name: 'farewell', keywords: ['goodbye', 'bye', 'thanks', 'thank you', 'see you'], confidence: 0.9 },
        { name: 'help_request', keywords: ['help', 'assist', 'support', 'how to'], confidence: 0.6 }
    ];

    let bestMatch = { name: 'general_help', confidence: 0.3 };
    
    for (const intent of intents) {
        const matches = intent.keywords.filter(keyword => lowerMessage.includes(keyword));
        if (matches.length > 0) {
            const confidence = intent.confidence * (matches.length / intent.keywords.length);
            if (confidence > bestMatch.confidence) {
                bestMatch = { name: intent.name, confidence };
            }
        }
    }

    return bestMatch;
}

// Response Generation
// ===================

function generateResponse(intent, message, session) {
    const { templates } = chatbotSettings;
    const sessionHistory = conversationHistory.get(session.id) || [];
    
    // Context-aware response generation
    switch (intent.name) {
        case 'search_assistance':
            return handleSearchAssistance(message, session);
            
        case 'navigation_help':
            return {
                message: "Here are some navigation tips for GovWin IQ:\n\n• Use the main dashboard for an overview of your activities\n• The search bar is available on every page for quick access\n• Check 'My Opportunities' to view saved and tracked items\n• Use the filters panel to narrow down search results\n• Access reports from the Analytics menu\n\nWhat specific area would you like help navigating?",
                suggestions: templates.suggestions.navigation,
                intent: intent.name,
                confidence: intent.confidence
            };
            
        case 'report_generation':
            return {
                message: "GovWin IQ offers several powerful reporting options:\n\n📊 **Opportunity Reports** - Track opportunities by status, value, agency\n📈 **Market Intelligence** - Industry trends and competitive analysis\n🎯 **Custom Dashboards** - Personalized analytics and KPIs\n📄 **Export Options** - Excel, PDF, and CSV formats available\n\nWhich type of report would you like to generate?",
                suggestions: templates.suggestions.general,
                intent: intent.name,
                confidence: intent.confidence
            };
            
        case 'greeting':
            const greetingTemplate = getTimeBasedGreeting();
            return {
                message: greetingTemplate,
                suggestions: templates.suggestions.general,
                intent: intent.name,
                confidence: intent.confidence
            };
            
        case 'farewell':
            const farewellMessage = templates.farewell.variants[
                Math.floor(Math.random() * templates.farewell.variants.length)
            ];
            return {
                message: farewellMessage,
                suggestions: [],
                intent: intent.name,
                confidence: intent.confidence
            };
            
        case 'help_request':
            return {
                message: "I'm here to help you get the most out of GovWin IQ! I can assist you with:\n\n🔍 **Search & Discovery** - Find opportunities, vendors, and agencies\n🧭 **Navigation** - Guide you through platform features\n📊 **Reports & Analytics** - Generate insights and export data\n❓ **General Questions** - Answer questions about platform capabilities\n\nWhat would you like help with today?",
                suggestions: templates.suggestions.general,
                intent: intent.name,
                confidence: intent.confidence
            };
            
        default:
            return {
                message: templates.fallback.withSuggestions,
                suggestions: templates.suggestions.general,
                intent: 'fallback',
                confidence: 0.3
            };
    }
}

function handleSearchAssistance(message, session) {
    try {
        const response = searchFlow.handleUserInput(message, session.context);
        
        // Update session context with search flow state
        updateSession(session.id, {
            context: {
                ...session.context,
                currentFlow: 'search_assistance',
                flowState: response.followUp || {}
            }
        });
        
        return {
            message: response.message,
            suggestions: response.options || chatbotSettings.templates.suggestions.search,
            intent: 'search_assistance',
            confidence: 0.8,
            followUp: response.followUp
        };
    } catch (error) {
        console.error('Search assistance error:', error);
        return {
            message: chatbotSettings.templates.fallback.primary,
            suggestions: chatbotSettings.templates.suggestions.general,
            intent: 'error',
            confidence: 0.1
        };
    }
}

function getTimeBasedGreeting() {
    const hour = new Date().getHours();
    const { templates } = chatbotSettings;
    
    if (hour < 12) {
        return templates.greeting.timeBasedVariants.morning;
    } else if (hour < 17) {
        return templates.greeting.timeBasedVariants.afternoon;
    } else {
        return templates.greeting.timeBasedVariants.evening;
    }
}

// API Routes
// ==========

// System health endpoint
app.get('/api/v1/system/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: apiConfig.version,
        services: {
            database: 'connected',
            cache: 'connected',
            api: 'operational'
        }
    });
});

// System readiness endpoint
app.get('/api/v1/system/ready', (req, res) => {
    res.json({
        success: true,
        status: 'ready',
        timestamp: new Date().toISOString()
    });
});

// Version endpoint
app.get('/api/v1/system/version', (req, res) => {
    res.json({
        success: true,
        version: apiConfig.version,
        name: 'GovWin IQ Chatbot API',
        timestamp: new Date().toISOString()
    });
});

// Create chat session
app.post('/api/v1/chat/session', (req, res) => {
    try {
        const { userId, platform, metadata } = req.body;
        
        const session = createSession(userId || 'anonymous', platform || 'web', metadata);
        
        res.json({
            success: true,
            sessionId: session.id,
            message: chatbotSettings.templates.greeting.primary,
            suggestions: chatbotSettings.templates.suggestions.general,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: {
                code: 'SESSION_CREATION_FAILED',
                message: 'Failed to create chat session',
                details: error.message
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Send message endpoint
app.post('/api/v1/chat/message', (req, res) => {
    try {
        const { message, sessionId, userId, context } = req.body;
        
        // Validation
        if (!message || !sessionId) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Message and sessionId are required',
                    details: { message: !!message, sessionId: !!sessionId }
                },
                timestamp: new Date().toISOString()
            });
        }
        
        // Get or create session
        let session = getSession(sessionId);
        if (!session) {
            session = createSession(userId || 'anonymous', context?.platform || 'web', context);
        }
        
        // Intent recognition
        const intent = recognizeIntent(message);
        
        // Generate response
        const response = generateResponse(intent, message, session);
        
        // Update session
        updateSession(sessionId, {
            turnCount: session.turnCount + 1,
            context: {
                ...session.context,
                lastIntent: intent.name,
                lastConfidence: intent.confidence
            }
        });
        
        // Store conversation history
        const history = conversationHistory.get(sessionId) || [];
        history.push(
            { role: 'user', content: message, timestamp: new Date() },
            { role: 'assistant', content: response.message, timestamp: new Date() }
        );
        conversationHistory.set(sessionId, history);
        
        // Return response
        res.json({
            success: true,
            message: response.message,
            intent: response.intent,
            confidence: response.confidence,
            suggestions: response.suggestions || [],
            sessionId: sessionId,
            turnCount: session.turnCount,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Message processing error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'MESSAGE_PROCESSING_FAILED',
                message: 'Failed to process message',
                details: error.message
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Get conversation history
app.get('/api/v1/chat/session/:sessionId/history', (req, res) => {
    try {
        const { sessionId } = req.params;
        const { limit = 50, offset = 0 } = req.query;
        
        const history = conversationHistory.get(sessionId) || [];
        const paginatedHistory = history.slice(offset, offset + parseInt(limit));
        
        res.json({
            success: true,
            history: paginatedHistory,
            total: history.length,
            limit: parseInt(limit),
            offset: parseInt(offset),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: {
                code: 'HISTORY_RETRIEVAL_FAILED',
                message: 'Failed to retrieve conversation history',
                details: error.message
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Mock GovWin search endpoint
app.post('/api/v1/govwin/search', (req, res) => {
    try {
        const { query, filters, limit = 10 } = req.body;
        
        // Mock search results
        const mockResults = [
            {
                id: 'opp_001',
                title: 'IT Modernization Services',
                agency: 'Department of Defense',
                value: '$5,000,000',
                dueDate: '2025-10-15',
                naics: '541511',
                setAside: 'Small Business'
            },
            {
                id: 'opp_002', 
                title: 'Cybersecurity Consulting',
                agency: 'Department of Homeland Security',
                value: '$2,500,000',
                dueDate: '2025-09-30',
                naics: '541512',
                setAside: 'SDVOSB'
            }
        ];
        
        res.json({
            success: true,
            results: mockResults.slice(0, limit),
            total: mockResults.length,
            query,
            filters,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: {
                code: 'SEARCH_FAILED',
                message: 'Search operation failed',
                details: error.message
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    
    const statusCode = error.statusCode || 500;
    const errorResponse = {
        success: false,
        error: {
            code: error.code || 'INTERNAL_SERVER_ERROR',
            message: error.message || 'An unexpected error occurred',
            ...(apiConfig.responses.error.includeDetails && { details: error.details })
        },
        requestId: req.id,
        timestamp: new Date().toISOString()
    };
    
    if (apiConfig.responses.error.includeStack && process.env.NODE_ENV === 'development') {
        errorResponse.error.stack = error.stack;
    }
    
    res.status(statusCode).json(errorResponse);
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'ENDPOINT_NOT_FOUND',
            message: `Endpoint ${req.method} ${req.originalUrl} not found`,
            availableEndpoints: [
                'GET /api/v1/system/health',
                'POST /api/v1/chat/session',
                'POST /api/v1/chat/message',
                'GET /api/v1/chat/session/:sessionId/history',
                'POST /api/v1/govwin/search'
            ]
        },
        timestamp: new Date().toISOString()
    });
});

// Session cleanup (run every 30 minutes)
setInterval(() => {
    const now = new Date();
    const timeoutMs = chatbotParameters.conversationFlow.session.maxDurationMinutes * 60 * 1000;
    
    for (const [sessionId, session] of activeSessions.entries()) {
        if (now - session.lastActivity > timeoutMs) {
            activeSessions.delete(sessionId);
            conversationHistory.delete(sessionId);
            console.log(`Cleaned up expired session: ${sessionId}`);
        }
    }
}, 30 * 60 * 1000);

// Server startup
const PORT = envConfig.app.port || 3000;
const HOST = envConfig.app.host || '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`🤖 GovWin IQ Chatbot Server running at http://${HOST}:${PORT}`);
    console.log(`📚 API Documentation: http://${HOST}:${PORT}/api/v1/system/version`);
    console.log(`💚 Health Check: http://${HOST}:${PORT}/api/v1/system/health`);
    console.log(`🌐 Demo Interface: Open demo/index.html in your browser`);
});

module.exports = app;