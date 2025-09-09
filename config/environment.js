/**
 * Environment Configuration for GovWin IQ Chatbot
 * Manages environment variables and API configurations
 */

class EnvironmentConfig {
    constructor() {
        this.env = process.env.NODE_ENV || 'development';
        this.config = this.loadConfig();
    }

    loadConfig() {
        const baseConfig = {
            app: {
                name: 'GovWin IQ Chatbot',
                version: '1.0.0',
                port: process.env.PORT || 3000,
                host: process.env.HOST || 'localhost'
            },
            
            // Database Configuration
            database: {
                url: process.env.DATABASE_URL || 'mongodb://localhost:27017/govwin-iq-chatbot',
                options: {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    maxPoolSize: 10
                }
            },

            // External API Configurations
            apis: {
                govwin: {
                    baseUrl: process.env.GOVWIN_API_URL || 'https://api.govwin.com',
                    apiKey: process.env.GOVWIN_API_KEY,
                    timeout: parseInt(process.env.API_TIMEOUT) || 30000,
                    rateLimit: {
                        requests: 100,
                        per: 'hour'
                    }
                },
                
                openai: {
                    apiKey: process.env.OPENAI_API_KEY,
                    model: process.env.OPENAI_MODEL || 'gpt-4',
                    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000,
                    temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7
                },

                webhook: {
                    secret: process.env.WEBHOOK_SECRET,
                    endpoints: {
                        slack: process.env.SLACK_WEBHOOK_URL,
                        teams: process.env.TEAMS_WEBHOOK_URL,
                        generic: process.env.GENERIC_WEBHOOK_URL
                    }
                }
            },

            // Chatbot Platform Configuration
            platforms: {
                slack: {
                    botToken: process.env.SLACK_BOT_TOKEN,
                    signingSecret: process.env.SLACK_SIGNING_SECRET,
                    appToken: process.env.SLACK_APP_TOKEN
                },
                
                teams: {
                    appId: process.env.TEAMS_APP_ID,
                    appPassword: process.env.TEAMS_APP_PASSWORD,
                    tenantId: process.env.TEAMS_TENANT_ID
                },

                web: {
                    enabled: process.env.WEB_INTERFACE === 'true',
                    cors: {
                        origin: process.env.CORS_ORIGIN || '*',
                        credentials: true
                    }
                }
            },

            // Security Configuration
            security: {
                jwtSecret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
                jwtExpiry: process.env.JWT_EXPIRY || '24h',
                bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
                rateLimiting: {
                    windowMs: 15 * 60 * 1000, // 15 minutes
                    max: 100 // limit each IP to 100 requests per windowMs
                }
            },

            // Logging Configuration
            logging: {
                level: process.env.LOG_LEVEL || 'info',
                format: process.env.LOG_FORMAT || 'json',
                destination: process.env.LOG_DESTINATION || 'console',
                file: {
                    path: process.env.LOG_FILE_PATH || './logs/app.log',
                    maxSize: process.env.LOG_MAX_SIZE || '10MB',
                    maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5
                }
            },

            // Cache Configuration
            cache: {
                type: process.env.CACHE_TYPE || 'memory',
                redis: {
                    url: process.env.REDIS_URL || 'redis://localhost:6379',
                    ttl: parseInt(process.env.CACHE_TTL) || 3600
                },
                memory: {
                    max: parseInt(process.env.MEMORY_CACHE_MAX) || 100,
                    ttl: parseInt(process.env.MEMORY_CACHE_TTL) || 3600
                }
            }
        };

        // Environment-specific overrides
        const envConfigs = {
            development: {
                logging: {
                    level: 'debug',
                    format: 'pretty'
                },
                security: {
                    rateLimiting: {
                        max: 1000 // More lenient for development
                    }
                }
            },

            production: {
                logging: {
                    level: 'warn',
                    destination: 'file'
                },
                security: {
                    rateLimiting: {
                        max: 50 // Stricter for production
                    }
                }
            },

            test: {
                database: {
                    url: process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/govwin-iq-chatbot-test'
                },
                logging: {
                    level: 'silent'
                }
            }
        };

        return this.mergeConfigs(baseConfig, envConfigs[this.env] || {});
    }

    mergeConfigs(base, override) {
        const merged = { ...base };
        
        for (const [key, value] of Object.entries(override)) {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                merged[key] = this.mergeConfigs(merged[key] || {}, value);
            } else {
                merged[key] = value;
            }
        }
        
        return merged;
    }

    get(path) {
        return path.split('.').reduce((config, key) => config?.[key], this.config);
    }

    validate() {
        const required = [
            'apis.govwin.apiKey',
            'apis.openai.apiKey',
            'security.jwtSecret'
        ];

        const missing = required.filter(path => !this.get(path));
        
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }

        return true;
    }

    // Helper methods for common configurations
    isDevelopment() {
        return this.env === 'development';
    }

    isProduction() {
        return this.env === 'production';
    }

    isTest() {
        return this.env === 'test';
    }

    getApiConfig(service) {
        return this.get(`apis.${service}`);
    }

    getPlatformConfig(platform) {
        return this.get(`platforms.${platform}`);
    }
}

// Create singleton instance
const environmentConfig = new EnvironmentConfig();

module.exports = {
    EnvironmentConfig,
    config: environmentConfig.config,
    get: environmentConfig.get.bind(environmentConfig),
    validate: environmentConfig.validate.bind(environmentConfig),
    isDevelopment: environmentConfig.isDevelopment.bind(environmentConfig),
    isProduction: environmentConfig.isProduction.bind(environmentConfig),
    isTest: environmentConfig.isTest.bind(environmentConfig),
    getApiConfig: environmentConfig.getApiConfig.bind(environmentConfig),
    getPlatformConfig: environmentConfig.getPlatformConfig.bind(environmentConfig)
};