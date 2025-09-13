/**
 * GovWin IQ Chatbot - Single File Railway Deployment
 * 
 * Consolidated deployment file containing all components to eliminate import/path issues
 * Includes: Express server, 2-agent coordinator, infrastructure, and all dependencies
 * 
 * Architecture: 2-Agent Customer Success Management System
 * - Search & Navigation Agent: Guides users through GovWin's search tools
 * - Customer Success Agent: Platform navigation, troubleshooting, escalation
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// ================== EMBEDDED LOGGER CLASS ==================
class Logger {
    constructor(level = 'info') {
        this.level = level;
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };
    }

    log(level, message, meta = {}) {
        if (this.levels[level] <= this.levels[this.level]) {
            const timestamp = new Date().toISOString();
            const logEntry = {
                timestamp,
                level: level.toUpperCase(),
                message,
                ...meta
            };
            
            console.log(JSON.stringify(logEntry));
        }
    }

    error(message, meta = {}) { this.log('error', message, meta); }
    warn(message, meta = {}) { this.log('warn', message, meta); }
    info(message, meta = {}) { this.log('info', message, meta); }
    debug(message, meta = {}) { this.log('debug', message, meta); }
}

// ================== EMBEDDED CONFIG CLASSES ==================
class AppConfig {
    constructor() {
        this.config = {
            port: process.env.PORT || 3000,
            env: process.env.NODE_ENV || 'development',
            maxConcurrency: parseInt(process.env.MAX_CONCURRENCY) || 100,
            responseTimeout: parseInt(process.env.RESPONSE_TIMEOUT) || 15000,
            cacheTTL: parseInt(process.env.CACHE_TTL) || 300,
            workerPool: parseInt(process.env.WORKER_POOL_SIZE) || 4,
            circuitBreaker: {
                failureThreshold: 5,
                resetTimeout: 30000
            },
            rateLimiting: {
                windowMs: 15 * 60 * 1000,
                max: 100
            },
            logging: {
                level: process.env.LOG_LEVEL || 'info'
            }
        };
    }
    
    get(key) { return this.config[key]; }
    getAll() { return this.config; }
}

class DatabaseConfig {
    constructor() {
        this.redisConfig = {
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
            db: 0,
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => Math.min(times * 50, 2000),
            lazyConnect: true,
            keepAlive: 30000,
            connectTimeout: 10000,
            commandTimeout: 5000
        };
    }

    getRedisConfig() { return this.redisConfig; }
}

// ================== EMBEDDED REDIS CLIENT ==================
class RedisClient {
    constructor(config) {
        this.config = config;
        this.client = null;
        this.isConnected = false;
        this.connectionAttempts = 0;
        this.maxConnectionAttempts = 5;
    }

    async connect() {
        try {
            // Try to connect to Redis if available
            if (process.env.REDIS_URL || process.env.REDIS_HOST) {
                const Redis = require('redis');
                this.client = Redis.createClient(this.config);
                
                this.client.on('error', this.handleError.bind(this));
                this.client.on('connect', () => console.log('Redis client connected'));
                this.client.on('ready', () => { 
                    console.log('Redis client ready');
                    this.isConnected = true;
                });
                this.client.on('end', () => {
                    console.log('Redis connection ended');
                    this.isConnected = false;
                });
                
                await this.client.connect();
                const pong = await this.client.ping();
                if (pong !== 'PONG') throw new Error('Redis ping failed');
                
                console.log('Redis connected successfully');
                this.isConnected = true;
                this.connectionAttempts = 0;
                return this.client;
            } else {
                // Use mock Redis for environments without Redis
                console.log('Redis not available, using in-memory fallback');
                this.client = new MockRedisClient();
                this.isConnected = true;
                return this.client;
            }
        } catch (error) {
            console.log('Redis connection failed, using in-memory fallback:', error.message);
            this.client = new MockRedisClient();
            this.isConnected = true;
            return this.client;
        }
    }

    handleError(error) {
        console.error('Redis error:', error);
        this.isConnected = false;
    }

    async disconnect() {
        if (this.client && this.client.quit) {
            await this.client.quit();
        }
        this.client = null;
        this.isConnected = false;
    }

    async healthCheck() {
        try {
            if (!this.client || !this.isConnected) {
                return { status: 'disconnected' };
            }
            
            if (this.client.ping) {
                const start = Date.now();
                const result = await this.client.ping();
                const latency = Date.now() - start;
                
                return {
                    status: result === 'PONG' ? 'healthy' : 'unhealthy',
                    latency,
                    connected: this.isConnected
                };
            }
            
            return { status: 'mock_redis', connected: true };
        } catch (error) {
            return { status: 'error', error: error.message, connected: false };
        }
    }
}

// ================== MOCK REDIS CLIENT ==================
class MockRedisClient {
    constructor() {
        this.store = new Map();
        this.isConnected = true;
    }

    async connect() { return this; }
    async ping() { return 'PONG'; }
    async quit() { this.isConnected = false; }
    
    async set(key, value, options = {}) {
        this.store.set(key, { value, expiry: options.EX ? Date.now() + (options.EX * 1000) : null });
        return 'OK';
    }
    
    async get(key) {
        const item = this.store.get(key);
        if (!item) return null;
        if (item.expiry && Date.now() > item.expiry) {
            this.store.delete(key);
            return null;
        }
        return item.value;
    }
    
    async del(key) {
        return this.store.delete(key) ? 1 : 0;
    }
    
    async exists(key) {
        return this.store.has(key) ? 1 : 0;
    }
}

// ================== SEARCH & NAVIGATION AGENT ==================
class SearchNavigationAgent {
    constructor(logger) {
        this.logger = logger;
        this.agentId = 'search-navigation';
        this.capabilities = [
            'search_guidance', 'filter_navigation', 'opportunity_discovery',
            'search_optimization', 'saved_searches', 'alert_setup', 'navigation_tutorials'
        ];
    }

    async processQuery(query, context = {}) {
        try {
            const searchIntent = this.analyzeSearchIntent(query);
            const guidance = await this.generateSearchGuidance(searchIntent, query, context);
            
            return {
                agentId: this.agentId,
                content: guidance.content,
                guidanceType: guidance.type,
                nextSteps: guidance.nextSteps,
                navigationPath: guidance.navigationPath,
                confidence: guidance.confidence,
                category: 'search_navigation'
            };
        } catch (error) {
            this.logger.error('Search Navigation Agent error', { error: error.message, query });
            return this.createFallbackResponse(query);
        }
    }

    analyzeSearchIntent(query) {
        const queryLower = query.toLowerCase();
        
        if (queryLower.includes('how') && (queryLower.includes('search') || queryLower.includes('find'))) {
            if (queryLower.includes('federal')) return 'federal_search_how_to';
            if (queryLower.includes('sled') || queryLower.includes('state') || queryLower.includes('local')) return 'sled_search_how_to';
            return 'general_search_how_to';
        }
        
        if (queryLower.includes('filter') || queryLower.includes('refine')) return 'search_filtering';
        if (queryLower.includes('save') && queryLower.includes('search')) return 'save_search';
        if (queryLower.includes('alert') || queryLower.includes('notification')) return 'search_alerts';
        if (queryLower.includes('advanced search')) return 'advanced_search';
        
        return 'general_search_guidance';
    }

    async generateSearchGuidance(intent, query, context) {
        const guidanceMap = {
            federal_search_how_to: {
                type: 'federal_search_tutorial',
                content: `Here's how to effectively search for federal opportunities in GovWin:

**Step 1: Navigate to Federal Search**
- Go to "Opportunities" → "Federal" in the main navigation
- This takes you to GovWin's federal opportunity search interface

**Step 2: Use Search Filters**
- **Agency Filter**: Select specific agencies you want to target
- **NAICS Codes**: Enter your company's NAICS codes for relevant opportunities
- **Set-Aside Types**: Choose Small Business, 8(a), HUBZone, etc. as applicable
- **Dollar Range**: Set minimum and maximum contract values
- **Geographic Region**: Limit by state or region if needed

**Step 3: Advanced Search Features**
- Use the "Keywords" field for specific terms in opportunity descriptions
- Set "Posted Date" ranges to find recent opportunities
- Use "Response Deadline" to prioritize urgent opportunities

**Pro Tips for Better Results:**
- Start broad, then narrow with filters
- Save successful searches for future use
- Set up alerts for your saved searches`,
                confidence: 0.9,
                nextSteps: [
                    "Navigate to Opportunities → Federal",
                    "Apply relevant filters for your business",
                    "Save your search for future use",
                    "Set up alerts for new matching opportunities"
                ],
                navigationPath: ["Main Menu", "Opportunities", "Federal", "Search & Filters"]
            },
            
            sled_search_how_to: {
                type: 'sled_search_tutorial',
                content: `Here's how to search for SLED (State, Local, Education) opportunities in GovWin:

**Step 1: Access SLED Search**
- Navigate to "Opportunities" → "SLED" in the main menu
- This opens the state and local government opportunity search

**Step 2: Geographic Filtering**
- **State Selection**: Choose specific states where you can perform work
- **Entity Type**: Select State Agencies, Cities, Counties, School Districts, etc.
- **Region Focus**: Some states have regional purchasing cooperatives

**Step 3: Opportunity Characteristics**
- **Contract Types**: Select RFP, RFQ, ITB, or other solicitation types
- **Industry Categories**: Use industry-specific filters
- **Contract Value**: Set appropriate dollar ranges for SLED markets

**Key SLED Search Tips:**
- SLED opportunities often have shorter response times than federal
- Local businesses may have preferences or requirements
- Educational institutions often have unique procurement cycles
- State contracts may include cooperative purchasing options`,
                confidence: 0.85,
                nextSteps: [
                    "Go to Opportunities → SLED",
                    "Select target states and entity types",
                    "Apply industry and value filters",
                    "Review opportunity details and deadlines"
                ],
                navigationPath: ["Main Menu", "Opportunities", "SLED", "Geographic & Entity Filters"]
            },
            
            search_filtering: {
                type: 'filtering_guidance',
                content: `Master GovWin's filtering system to find the most relevant opportunities:

**Primary Filters (Always Use These):**
- **Industry/NAICS**: Critical for relevance
- **Geographic**: Where you can perform work
- **Contract Value**: Match your company's capacity
- **Set-Aside Types**: If you qualify for small business programs

**Advanced Filtering Options:**
- **Keywords**: Search within opportunity descriptions
- **Agency/Entity**: Target specific buyers
- **Procurement Method**: RFP, RFQ, GSA Schedule, etc.
- **Competition Level**: Some filters show estimated competition

**Filter Strategy:**
1. Start with broad industry categories
2. Add geographic constraints
3. Apply value ranges appropriate for your business
4. Use keywords to find specific technology or service needs
5. Refine based on your past performance or capabilities

**Pro Tips:**
- Use "Save Search" to preserve effective filter combinations
- Combine multiple NAICS codes if your business spans categories
- Don't over-filter initially - you might miss relevant opportunities`,
                confidence: 0.85,
                nextSteps: [
                    "Start with industry/NAICS filters",
                    "Add geographic and value constraints",
                    "Test keyword combinations",
                    "Save effective filter sets"
                ],
                navigationPath: ["Search Interface", "Filters Panel", "Apply & Refine"]
            },
            
            save_search: {
                type: 'saved_search_tutorial',
                content: `Save your searches in GovWin to monitor opportunities efficiently:

**How to Save a Search:**
1. Configure your search filters to get relevant results
2. Look for the "Save Search" button (usually near the search results)
3. Give your search a descriptive name (e.g., "IT Services - Federal - $100K-$5M")
4. Choose alert frequency (daily, weekly, or as opportunities are posted)

**Managing Saved Searches:**
- Access saved searches from "My Searches" or "Saved Searches" in your account
- Edit filters or alert settings anytime
- Delete outdated searches to keep your dashboard clean

**Best Practices:**
- Create separate searches for different business lines
- Use descriptive names that make sense weeks later  
- Start with weekly alerts, adjust frequency based on volume
- Review and update searches quarterly as your business evolves

**Alert Setup:**
- Choose email notifications for critical searches
- Set up dashboard alerts for monitoring within GovWin
- Configure frequency to avoid alert fatigue`,
                confidence: 0.9,
                nextSteps: [
                    "Perfect your search filters first",
                    "Click 'Save Search' and name it descriptively",
                    "Set appropriate alert frequency",
                    "Test the alert system with a sample search"
                ],
                navigationPath: ["Search Results", "Save Search", "My Account", "Saved Searches"]
            },
            
            search_alerts: {
                type: 'alert_setup_guide',
                content: `Set up GovWin alerts to never miss relevant opportunities:

**Types of Alerts Available:**
- **New Opportunity Alerts**: When opportunities matching your criteria are posted
- **Deadline Reminders**: Notifications before response deadlines
- **Award Notifications**: When contracts in your areas are awarded
- **Amendment Alerts**: Changes to opportunities you're tracking

**Setting Up New Opportunity Alerts:**
1. Create and save a search with your desired filters
2. When saving, select "Email Alerts" 
3. Choose frequency: Immediate, Daily Digest, or Weekly Summary
4. Specify which email address should receive alerts

**Alert Management:**
- Review your alerts in "Account Settings" → "Notifications"
- Adjust frequency if you're getting too many or too few alerts
- Temporarily disable alerts when you're at capacity
- Update alert criteria as your business focus changes

**Pro Tips for Effective Alerts:**
- Start with weekly digests to avoid overwhelming your inbox
- Create focused alerts rather than broad ones
- Use different email addresses for different types of opportunities
- Review alert performance monthly and adjust as needed`,
                confidence: 0.88,
                nextSteps: [
                    "Access Account Settings → Notifications",
                    "Review existing alert settings",
                    "Create focused alert criteria",
                    "Test alert delivery and adjust frequency"
                ],
                navigationPath: ["Account Menu", "Settings", "Notifications", "Alert Management"]
            }
        };

        return guidanceMap[intent] || {
            type: 'general_search_guidance',
            content: `I can help you navigate GovWin's search capabilities more effectively.

**Quick Search Tips:**
- Use the main "Opportunities" menu to access Federal or SLED searches
- Apply filters gradually: industry first, then geography and value
- Save successful searches to monitor for new opportunities
- Set up alerts to stay informed about relevant opportunities

**What would you like to learn more about?**
- How to search for federal opportunities
- SLED (state/local) opportunity discovery
- Using filters effectively
- Setting up saved searches and alerts
- Advanced search techniques

Feel free to ask about any specific aspect of opportunity search in GovWin!`,
            confidence: 0.7,
            nextSteps: [
                "Choose your opportunity type (Federal or SLED)",
                "Start with basic filters",
                "Explore advanced search features",
                "Set up monitoring for ongoing opportunities"
            ],
            navigationPath: ["Opportunities Menu", "Search Interface"]
        };
    }

    createFallbackResponse(query) {
        return {
            agentId: this.agentId,
            content: `I'm here to help you navigate GovWin's search and discovery tools. 

I can guide you through:
- Finding federal opportunities
- Searching SLED markets
- Using filters effectively
- Setting up saved searches and alerts

What specific aspect of opportunity search would you like help with?`,
            guidanceType: 'search_navigation_fallback',
            nextSteps: [
                "Ask about federal or SLED opportunity search",
                "Request guidance on using search filters",
                "Learn about saved searches and alerts"
            ],
            navigationPath: [],
            confidence: 0.6,
            category: 'search_navigation'
        };
    }
}

// ================== CUSTOMER SUCCESS AGENT ==================
class CustomerSuccessAgent {
    constructor(logger) {
        this.logger = logger;
        this.agentId = 'customer-success';
        this.capabilities = [
            'platform_navigation', 'troubleshooting_support', 'workflow_guidance',
            'reporting_tools', 'tracking_features', 'user_training',
            'escalation_management', 'feature_education', 'best_practices'
        ];
    }

    async processQuery(query, context = {}) {
        try {
            const supportIntent = this.analyzeSupportIntent(query);
            const guidance = await this.generateSuccessGuidance(supportIntent, query, context);
            
            return {
                agentId: this.agentId,
                content: guidance.content,
                guidanceType: guidance.type,
                nextSteps: guidance.nextSteps,
                escalationSuggested: guidance.escalationSuggested || false,
                urgency: guidance.urgency || 'normal',
                confidence: guidance.confidence,
                category: 'customer_success'
            };
        } catch (error) {
            this.logger.error('Customer Success Agent error', { error: error.message, query });
            return this.createEscalationResponse(query, error);
        }
    }

    analyzeSupportIntent(query) {
        const queryLower = query.toLowerCase();
        
        // Technical issues
        if (['error', 'problem', 'issue', 'broken', 'not working'].some(word => queryLower.includes(word))) {
            if (queryLower.includes('login') || queryLower.includes('access')) return 'login_access_issue';
            if (queryLower.includes('report') || queryLower.includes('dashboard')) return 'reporting_issue';
            return 'technical_problem';
        }
        
        // Account and user management
        if (['user', 'account', 'team', 'permission', 'access'].some(word => queryLower.includes(word))) {
            return 'user_account_management';
        }
        
        // Reporting and analytics
        if (['report', 'analytics', 'dashboard', 'pipeline', 'tracking'].some(word => queryLower.includes(word))) {
            return 'reporting_guidance';
        }
        
        // Integration and data management
        if (['integration', 'api', 'sync', 'export', 'import'].some(word => queryLower.includes(word))) {
            return 'integration_support';
        }
        
        // Training and best practices
        if (['how to', 'best practice', 'workflow', 'process', 'training'].some(phrase => queryLower.includes(phrase))) {
            return 'training_workflow';
        }
        
        return 'general_support';
    }

    async generateSuccessGuidance(intent, query, context) {
        const guidanceMap = {
            login_access_issue: {
                type: 'access_troubleshooting',
                content: `Let's resolve your GovWin access issue quickly:

**Common Login Solutions:**
1. **Password Reset**: Use the "Forgot Password" link on the login page
2. **Clear Browser Cache**: Clear cache and cookies for govwin.com
3. **Browser Compatibility**: Ensure you're using a supported browser (Chrome, Firefox, Safari, Edge)
4. **Check Caps Lock**: Ensure Caps Lock isn't interfering with password entry

**Account Lockout Issues:**
- After 5 failed login attempts, accounts are temporarily locked
- Wait 15 minutes, then try again with the correct credentials
- If still locked, use the password reset option

**Network/Corporate Firewall:**
- Some corporate firewalls block GovWin
- Try accessing from a different network or contact your IT department
- GovWin may need to be whitelisted in your organization

**Still Having Issues?**
If these steps don't resolve the problem, I'll escalate this to our technical support team who can:
- Check your account status
- Verify any network restrictions
- Provide direct login assistance`,
                confidence: 0.85,
                urgency: 'high',
                escalationSuggested: false,
                nextSteps: [
                    "Try password reset using the login page",
                    "Clear browser cache and cookies",
                    "Test from a different browser or network",
                    "Contact support if issue persists"
                ]
            },
            
            reporting_issue: {
                type: 'reporting_troubleshooting',
                content: `Let's get your GovWin reports working properly:

**Common Reporting Issues & Solutions:**

**Reports Not Loading:**
- Refresh the page and wait 30 seconds for data to load
- Check your date ranges - very large ranges can cause timeouts
- Try narrowing your filters to reduce data load

**Missing Data in Reports:**
- Verify your account has access to the data sources you're querying
- Check that your saved searches include the opportunities you expect
- Ensure date ranges cover the period when opportunities were posted

**Dashboard Not Updating:**
- Dashboards refresh every 4 hours during business hours
- Click the "Refresh" button to force an update
- Check if any filters are limiting what you see

**Export Problems:**
- Large exports (>1000 records) may take several minutes
- Check your Downloads folder - exports appear as CSV or Excel files
- Try smaller date ranges if exports are timing out

**Performance Issues:**
- Reports with many filters or large date ranges load slowly
- Consider breaking large reports into smaller, focused queries
- Use saved searches to pre-filter data before creating reports`,
                confidence: 0.8,
                urgency: 'normal',
                escalationSuggested: false,
                nextSteps: [
                    "Refresh the report page",
                    "Check and adjust date ranges and filters",
                    "Try exporting smaller data sets",
                    "Contact support if data seems incomplete"
                ]
            },
            
            user_account_management: {
                type: 'account_management_guide',
                content: `Here's how to manage users and permissions in GovWin:

**Adding New Users:**
- Go to "Account Settings" → "User Management"
- Click "Add User" and enter their email address
- Select appropriate permission level (Viewer, User, Admin)
- New users receive an email invitation to set up their account

**Permission Levels:**
- **Viewer**: Can view opportunities and reports only
- **User**: Can create saved searches, alerts, and personal reports
- **Admin**: Can manage all users and account settings

**Managing Existing Users:**
- Edit user permissions anytime from User Management
- Deactivate users who no longer need access
- Reset passwords for users having login issues

**Team Collaboration Features:**
- Share saved searches with team members
- Create team dashboards for shared visibility
- Set up group alerts for opportunity monitoring

**Account Settings:**
- Update company information in "Account Profile"
- Manage billing and subscription details
- Configure notification preferences
- Set up integrations with CRM systems

**Best Practices:**
- Regularly review user list and remove inactive users
- Use descriptive names for shared saved searches
- Set up role-based permissions to control data access`,
                confidence: 0.88,
                urgency: 'normal',
                escalationSuggested: false,
                nextSteps: [
                    "Navigate to Account Settings → User Management",
                    "Review current user permissions",
                    "Add or update users as needed",
                    "Configure team collaboration settings"
                ]
            },
            
            integration_support: {
                type: 'integration_guidance',
                content: `GovWin offers several integration options to streamline your workflow:

**Available Integrations:**
- **CRM Systems**: Salesforce, HubSpot, Pipedrive integration
- **Data Export**: CSV, Excel exports for custom analysis
- **API Access**: For custom integrations (Enterprise plans)
- **Calendar Sync**: Deadline reminders in Outlook/Google Calendar

**Setting Up CRM Integration:**
1. Go to "Account Settings" → "Integrations"
2. Select your CRM platform
3. Follow the authentication process
4. Configure data sync preferences (opportunities, contacts, etc.)
5. Set sync frequency (real-time, daily, weekly)

**Data Export Options:**
- **Manual Exports**: Download opportunity lists, reports
- **Scheduled Exports**: Automatic delivery via email
- **API Exports**: Real-time data access for custom systems

**Common Integration Issues:**
- **Authentication Errors**: Re-authorize the connection
- **Sync Delays**: Check sync frequency settings
- **Missing Fields**: Verify field mapping configuration
- **Duplicate Records**: Configure duplicate detection rules

**API Access (Enterprise):**
- RESTful API for custom integrations
- Real-time opportunity data access
- Webhook support for instant notifications
- Developer documentation and support available`,
                confidence: 0.82,
                urgency: 'normal',
                escalationSuggested: true,
                nextSteps: [
                    "Review integration options in Account Settings",
                    "Test CRM connection if applicable",
                    "Contact support for Enterprise API access",
                    "Configure automated export schedules"
                ]
            }
        };

        return guidanceMap[intent] || {
            type: 'general_customer_success',
            content: `I'm here to help you get the most out of GovWin IQ.

**I can assist with:**
- Technical troubleshooting and platform issues
- Account and user management
- Reports and analytics guidance
- Integration setup and configuration
- Workflow optimization and best practices
- Training on GovWin features

**Quick Help Options:**
- For urgent technical issues, I can escalate directly to our support team
- For training needs, I can guide you through specific features
- For account questions, I can walk you through the relevant settings

What specific area would you like help with today?`,
            confidence: 0.75,
            urgency: 'normal',
            escalationSuggested: false,
            nextSteps: [
                "Describe your specific issue or question",
                "Let me know if this is urgent",
                "I'll provide targeted guidance or escalate as needed"
            ]
        };
    }

    createEscalationResponse(query, error) {
        return {
            agentId: this.agentId,
            content: `I want to ensure you get immediate help with your question: "${query}"

I'm escalating this directly to a Customer Success Manager who can provide personalized assistance. Here's what happens next:

**Immediate Next Steps:**
- A Customer Success Manager will contact you within 1 hour
- They'll have access to your account details and history
- Be prepared to describe the issue and any error messages you've seen

**For Urgent Issues:**
- Call our priority support line if this is preventing critical work
- Email support@govwin.com with "URGENT" in the subject line
- Reference this conversation for context

**What to Have Ready:**
- Your account information
- Screenshots of any error messages
- Description of what you were trying to do when the issue occurred
- Your preferred contact method and availability

Your question is important, and we'll make sure you get the right solution quickly.`,
            guidanceType: 'escalation_response',
            nextSteps: [
                "Customer Success Manager will contact you within 1 hour",
                "Prepare account details and issue description",
                "Use priority support for urgent needs"
            ],
            escalationSuggested: true,
            urgency: 'high',
            confidence: 1.0,
            category: 'customer_success'
        };
    }
}

// ================== CSM 2-AGENT COORDINATOR ==================
class CSM2AgentCoordinator {
    constructor(logger) {
        this.logger = logger;
        this.coordinatorId = 'csm-2agent-coordinator';
        
        this.searchNavigationAgent = new SearchNavigationAgent(logger);
        this.customerSuccessAgent = new CustomerSuccessAgent(logger);
        
        this.agents = {
            'search-navigation': this.searchNavigationAgent,
            'customer-success': this.customerSuccessAgent
        };
    }

    async processQuery(query, userId, sessionContext = {}) {
        try {
            const routing = await this.analyzeAndRoute(query, sessionContext);
            const result = await this.executeWithAgent(routing.primaryAgent, query, routing, sessionContext);
            return this.formatCSMResponse(result, routing, query, userId);
        } catch (error) {
            this.logger.error('CSM 2-Agent Coordinator error', { 
                error: error.message, query, userId 
            });
            return this.createFallbackResponse(query, userId, error);
        }
    }

    async analyzeAndRoute(query, sessionContext = {}) {
        const queryLower = query.toLowerCase();
        
        let primaryAgent = 'customer-success';
        let confidence = 0.6;
        let routingReason = 'default_customer_success';

        if (this.isSearchNavigationQuery(queryLower)) {
            primaryAgent = 'search-navigation';
            confidence = 0.8;
            routingReason = 'search_navigation_intent';
        } else if (this.isCustomerSuccessQuery(queryLower)) {
            primaryAgent = 'customer-success';
            confidence = 0.9;
            routingReason = 'customer_success_intent';
        }

        return {
            primaryAgent,
            confidence,
            routingReason,
            requiresEscalation: this.requiresEscalation(queryLower),
            urgency: this.determineUrgency(queryLower),
            sessionContext
        };
    }

    isSearchNavigationQuery(queryLower) {
        const searchKeywords = [
            'how to search', 'how do i search', 'find opportunities', 'search for',
            'filter', 'filters', 'search results', 'advanced search',
            'federal opportunities', 'sled opportunities', 'state opportunities',
            'save search', 'saved searches', 'alert', 'alerts', 'monitor'
        ];
        return searchKeywords.some(keyword => queryLower.includes(keyword));
    }

    isCustomerSuccessQuery(queryLower) {
        const supportKeywords = [
            'error', 'problem', 'issue', 'broken', 'not working',
            'login', 'password', 'access', 'locked out',
            'report', 'reports', 'dashboard', 'analytics',
            'team', 'share', 'collaborate', 'permission', 'user',
            'account', 'subscription', 'billing', 'integration'
        ];
        return supportKeywords.some(keyword => queryLower.includes(keyword));
    }

    requiresEscalation(queryLower) {
        const escalationTriggers = [
            'manager', 'escalate', 'urgent', 'critical', 'emergency',
            'not working', 'cant access', 'billing issue'
        ];
        return escalationTriggers.some(trigger => queryLower.includes(trigger));
    }

    determineUrgency(queryLower) {
        if (['urgent', 'critical', 'emergency', 'down'].some(word => queryLower.includes(word))) {
            return 'critical';
        }
        if (['asap', 'soon', 'quickly', 'problem'].some(word => queryLower.includes(word))) {
            return 'high';
        }
        return 'normal';
    }

    async executeWithAgent(agentId, query, routing, sessionContext) {
        const agent = this.agents[agentId];
        if (!agent) throw new Error(`Unknown agent: ${agentId}`);

        const result = await agent.processQuery(query, {
            ...sessionContext, routing, urgency: routing.urgency
        });

        result.coordination = {
            selectedAgent: agentId,
            routingReason: routing.routingReason,
            routingConfidence: routing.confidence,
            timestamp: new Date().toISOString()
        };

        return result;
    }

    formatCSMResponse(agentResult, routing, query, userId) {
        return {
            success: true,
            queryId: this.generateQueryId(),
            userId, query,
            timestamp: new Date().toISOString(),
            
            agentUsed: agentResult.agentId,
            message: agentResult.content,
            guidanceType: agentResult.guidanceType,
            nextSteps: agentResult.nextSteps || [],
            
            escalationSuggested: agentResult.escalationSuggested || false,
            urgency: agentResult.urgency || routing.urgency || 'normal',
            confidence: agentResult.confidence || routing.confidence,
            
            navigationPath: agentResult.navigationPath || [],
            routing: {
                primaryAgent: routing.primaryAgent,
                routingReason: routing.routingReason,
                routingConfidence: routing.confidence
            },
            
            availableAgents: ['search-navigation', 'customer-success'],
            
            csmGuidance: [{
                agent: this.mapAgentToCSMType(agentResult.agentId),
                content: agentResult.content,
                guidanceType: agentResult.guidanceType || 'general_guidance',
                nextSteps: agentResult.nextSteps || [],
                confidence: agentResult.confidence || routing.confidence,
                role: 'primary'
            }]
        };
    }

    mapAgentToCSMType(agentId) {
        const mapping = {
            'search-navigation': 'SEARCH_NAVIGATION_GUIDE',
            'customer-success': 'CUSTOMER_SUCCESS_SUPPORT'
        };
        return mapping[agentId] || 'GENERAL_SUPPORT';
    }

    generateQueryId() {
        return `csm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    createFallbackResponse(query, userId, error) {
        return {
            success: false,
            queryId: this.generateQueryId(),
            userId, query,
            timestamp: new Date().toISOString(),
            
            agentUsed: 'fallback',
            message: `I apologize for the technical issue. Let me connect you directly with a Customer Success Manager who can provide immediate assistance.

Your question: "${query}"

A Customer Success Manager will contact you within the next hour to ensure you get the help you need.`,
            
            guidanceType: 'technical_fallback',
            nextSteps: [
                'Customer Success Manager will contact you within 1 hour',
                'Have your account details ready',
                'Consider phone support for urgent needs'
            ],
            
            escalationSuggested: true,
            urgency: 'high',
            confidence: 1.0,
            
            csmGuidance: [{
                agent: 'TECHNICAL_FALLBACK',
                content: 'Technical issue encountered - escalating to human support',
                guidanceType: 'error_escalation',
                nextSteps: [
                    'Immediate human support escalation',
                    'Customer Success Manager contact within 1 hour'
                ],
                confidence: 1.0,
                role: 'primary'
            }]
        };
    }
}

// ================== CSM 2-AGENT INTEGRATED COORDINATOR ==================
class CSM2AgentIntegratedCoordinator {
    constructor(redisClient, logger, config) {
        this.redisClient = redisClient;
        this.logger = logger;
        this.config = config || {};
        
        this.coordinator = new CSM2AgentCoordinator(logger);
        this.sessions = new Map();
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.cacheEnabled = !!redisClient;
        this.cacheTTL = 15 * 60; // 15 minutes
        
        this.logger.info('CSM 2-Agent Integrated Coordinator initialized', {
            cacheEnabled: this.cacheEnabled,
            sessionTimeout: this.sessionTimeout,
            availableAgents: ['search-navigation', 'customer-success']
        });
    }

    async processQuery(query, userId, metadata = {}) {
        const startTime = Date.now();
        const queryId = this.generateQueryId();
        
        try {
            this.logger.info('Processing CSM query', { 
                queryId, userId, 
                query: query.substring(0, 100) + (query.length > 100 ? '...' : '')
            });

            const sessionContext = await this.getSessionContext(userId);
            
            // Check cache first
            const cacheKey = this.generateCacheKey(query, userId);
            let result = null;
            
            if (this.cacheEnabled) {
                try {
                    const cachedResult = await this.redisClient.get(cacheKey);
                    if (cachedResult) {
                        result = JSON.parse(cachedResult);
                        result.fromCache = true;
                        result.queryId = queryId;
                        result.timestamp = new Date().toISOString();
                        
                        this.logger.info('Cache hit for query', { queryId, userId });
                        return result;
                    }
                } catch (cacheError) {
                    this.logger.warn('Cache read error', { error: cacheError.message });
                }
            }
            
            // Process with coordinator
            result = await this.coordinator.processQuery(query, userId, {
                ...sessionContext,
                ...metadata,
                queryId
            });
            
            // Update session context
            await this.updateSessionContext(userId, {
                lastQuery: query,
                lastResponse: result,
                queryCount: (sessionContext.queryCount || 0) + 1,
                lastActivity: Date.now()
            });
            
            // Cache successful results
            if (this.cacheEnabled && result.success) {
                try {
                    await this.redisClient.set(
                        cacheKey, 
                        JSON.stringify(result), 
                        { EX: this.cacheTTL }
                    );
                } catch (cacheError) {
                    this.logger.warn('Cache write error', { error: cacheError.message });
                }
            }
            
            // Add performance metrics
            result.processingTime = Date.now() - startTime;
            result.fromCache = false;
            
            this.logger.info('Query processed successfully', { 
                queryId, userId,
                processingTime: result.processingTime,
                agentUsed: result.agentUsed
            });
            
            return result;
            
        } catch (error) {
            this.logger.error('Query processing failed', { 
                queryId, userId, 
                error: error.message,
                processingTime: Date.now() - startTime
            });
            
            return this.coordinator.createFallbackResponse(query, userId, error);
        }
    }

    async getSessionContext(userId) {
        let session = this.sessions.get(userId);
        
        if (!session || (Date.now() - session.lastActivity) > this.sessionTimeout) {
            session = {
                userId,
                startTime: Date.now(),
                lastActivity: Date.now(),
                queryCount: 0,
                preferences: {}
            };
            this.sessions.set(userId, session);
        }
        
        return session;
    }

    async updateSessionContext(userId, updates) {
        const session = this.sessions.get(userId) || {};
        Object.assign(session, updates, { lastActivity: Date.now() });
        this.sessions.set(userId, session);
    }

    generateCacheKey(query, userId) {
        const queryHash = Buffer.from(query.toLowerCase().trim()).toString('base64').slice(0, 16);
        return `csm:query:${queryHash}:${userId}`;
    }

    generateQueryId() {
        return `csm-integrated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Health check and metrics
    async getMetrics() {
        return {
            totalQueries: 0,
            successfulQueries: 0,
            averageLatency: 0,
            activeConversations: this.sessions.size,
            existingAgents: ['search-navigation', 'customer-success'],
            cacheEnabled: this.cacheEnabled,
            sessionTimeout: this.sessionTimeout,
            lastUpdated: new Date().toISOString()
        };
    }
}

// ================== MAIN RAILWAY SERVER ==================
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
        // Health endpoint
        this.app.get('/api/v1/system/health', (req, res) => {
            res.json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || 'development',
                service: 'GovWin CSM - Railway Single-File Deployment',
                version: '1.0.0',
                architecture: '2-agent-embedded'
            });
        });

        // Status endpoint
        this.app.get('/api/v1/system/status', async (req, res) => {
            try {
                const metrics = this.csmCoordinator ? await this.csmCoordinator.getMetrics() : null;
                
                res.json({
                    service: 'GovWin CSM - Railway Single-File',
                    version: '1.0.0',
                    status: this.csmCoordinator ? 'operational' : 'initializing',
                    timestamp: new Date().toISOString(),
                    metrics: metrics,
                    deployment: {
                        platform: 'railway',
                        architecture: 'single-file-embedded',
                        agents: ['search-navigation', 'customer-success'],
                        environment: process.env.NODE_ENV || 'development',
                        port: process.env.PORT || 3000
                    }
                });
            } catch (error) {
                res.status(500).json({
                    service: 'GovWin CSM - Railway Single-File',
                    status: 'error',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Chat message endpoint
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
                    agentUsed: result.analysis?.targetAgent || result.agentUsed || 'auto-detected',
                    deployment: 'railway-single-file',
                    availableAgents: result.availableAgents || [],
                    architecture: '2-agent-embedded'
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
            console.log('Initializing Railway GovWin CSM Single-File Server...');
            
            // Initialize Redis with fallback
            this.redisClient = new RedisClient(this.dbConfig.getRedisConfig());
            await this.redisClient.connect();
            
            // Initialize CSM 2-agent coordinator
            this.csmCoordinator = new CSM2AgentIntegratedCoordinator(
                this.redisClient,
                this.logger,
                this.appConfig.getAll()
            );
            
            console.log('Railway single-file server initialized successfully');
            
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
            console.log('Architecture: Single-File 2-Agent Embedded System');
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
            return result.message || "I'm here to help you navigate GovWin IQ. What can I assist you with today?";
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

// ================== START THE SERVER ==================
if (require.main === module) {
    const server = new RailwayGovWinCSMServer();
    server.start().catch(error => {
        console.error('Failed to start Railway single-file server:', error);
        process.exit(1);
    });
}

module.exports = RailwayGovWinCSMServer;