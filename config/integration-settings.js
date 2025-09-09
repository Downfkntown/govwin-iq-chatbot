/**
 * Integration Settings for GovWin IQ Chatbot
 * Future GovWin platform integration parameters and configurations
 */

const integrationSettings = {
    version: '1.0.0',
    lastUpdated: '2025-09-09',
    description: 'Configuration for GovWin platform integrations and future expansion capabilities',

    // GovWin IQ Core Platform Integration
    govwinIQ: {
        api: {
            baseUrl: process.env.GOVWIN_API_BASE || 'https://api.govwin.com/v2',
            version: 'v2',
            timeout: parseInt(process.env.GOVWIN_API_TIMEOUT) || 30000,
            retries: parseInt(process.env.GOVWIN_API_RETRIES) || 3,
            authentication: {
                type: 'oauth2',
                clientId: process.env.GOVWIN_CLIENT_ID,
                clientSecret: process.env.GOVWIN_CLIENT_SECRET,
                scope: 'read write admin',
                tokenEndpoint: 'https://auth.govwin.com/oauth2/token',
                refreshThreshold: 300 // seconds before expiry
            },
            rateLimit: {
                requestsPerMinute: 100,
                burstLimit: 20,
                backoffStrategy: 'exponential'
            }
        },

        endpoints: {
            // Search and Discovery
            search: {
                opportunities: '/opportunities/search',
                vendors: '/vendors/search',
                agencies: '/agencies/search',
                contracts: '/contracts/search',
                awards: '/awards/search',
                forecasts: '/forecasts/search'
            },

            // Data Retrieval
            data: {
                opportunityDetails: '/opportunities/{id}',
                vendorProfile: '/vendors/{id}',
                agencyDetails: '/agencies/{id}',
                contractDetails: '/contracts/{id}',
                awardHistory: '/awards/{id}',
                forecastDetails: '/forecasts/{id}'
            },

            // User Management
            users: {
                profile: '/users/profile',
                preferences: '/users/preferences',
                savedSearches: '/users/saved-searches',
                watchlists: '/users/watchlists',
                alerts: '/users/alerts',
                usage: '/users/usage-stats'
            },

            // Analytics and Insights
            analytics: {
                marketIntelligence: '/analytics/market-intelligence',
                competitorAnalysis: '/analytics/competitors',
                trendAnalysis: '/analytics/trends',
                opportunityScoring: '/analytics/opportunity-scoring',
                bidRecommendations: '/analytics/bid-recommendations'
            },

            // Reporting
            reports: {
                generate: '/reports/generate',
                templates: '/reports/templates',
                scheduled: '/reports/scheduled',
                export: '/reports/export',
                dashboard: '/reports/dashboard'
            }
        },

        dataMapping: {
            // Map chatbot concepts to GovWin data structures
            entities: {
                opportunity: {
                    fields: ['id', 'title', 'description', 'agency', 'value', 'due_date', 'naics', 'set_aside'],
                    searchable: ['title', 'description', 'agency_name', 'naics_description'],
                    filterable: ['agency', 'value_range', 'due_date_range', 'naics', 'set_aside_type']
                },
                vendor: {
                    fields: ['id', 'name', 'duns', 'cage_code', 'capabilities', 'certifications'],
                    searchable: ['name', 'capabilities', 'location'],
                    filterable: ['certifications', 'size', 'location', 'industry']
                },
                agency: {
                    fields: ['id', 'name', 'type', 'parent_agency', 'contact_info'],
                    searchable: ['name', 'acronym', 'description'],
                    filterable: ['type', 'parent_agency', 'region']
                }
            },

            responses: {
                standardFormat: {
                    success: true,
                    data: '{}',
                    meta: {
                        total: 0,
                        page: 1,
                        per_page: 20,
                        has_more: false
                    },
                    timestamp: 'ISO8601'
                },
                errorFormat: {
                    success: false,
                    error: {
                        code: 'string',
                        message: 'string',
                        details: {}
                    },
                    timestamp: 'ISO8601'
                }
            }
        },

        caching: {
            enabled: true,
            ttl: {
                opportunities: 3600, // 1 hour
                vendors: 86400, // 1 day  
                agencies: 604800, // 1 week
                reports: 1800, // 30 minutes
                userPreferences: 3600 // 1 hour
            },
            invalidation: {
                onUpdate: true,
                onError: false,
                scheduledRefresh: true
            }
        },

        webhooks: {
            enabled: true,
            endpoint: '/webhooks/govwin',
            secret: process.env.GOVWIN_WEBHOOK_SECRET,
            events: [
                'opportunity.created',
                'opportunity.updated',
                'opportunity.cancelled',
                'award.announced',
                'forecast.published'
            ],
            retryPolicy: {
                maxRetries: 5,
                backoffMultiplier: 2,
                initialDelay: 1000
            }
        }
    },

    // Future GovWin Platform Extensions
    futureIntegrations: {
        // GovWin Intelligence Platform
        intelligence: {
            enabled: false,
            api: {
                baseUrl: 'https://intelligence.govwin.com/api/v1',
                features: [
                    'predictive_analytics',
                    'market_forecasting',
                    'competitive_intelligence',
                    'risk_assessment'
                ]
            },
            capabilities: {
                bidProbabilityScoring: true,
                marketTrendAnalysis: true,
                competitorTracking: true,
                riskAssessment: true
            }
        },

        // GovWin CRM Integration
        crm: {
            enabled: false,
            api: {
                baseUrl: 'https://crm.govwin.com/api/v1',
                features: [
                    'contact_management',
                    'opportunity_tracking',
                    'pipeline_management',
                    'activity_logging'
                ]
            },
            capabilities: {
                contactSync: true,
                opportunitySync: true,
                activityTracking: true,
                pipelineReporting: true
            }
        },

        // GovWin Proposal Management
        proposalManagement: {
            enabled: false,
            api: {
                baseUrl: 'https://proposals.govwin.com/api/v1',
                features: [
                    'document_management',
                    'collaboration_tools',
                    'compliance_checking',
                    'submission_tracking'
                ]
            },
            capabilities: {
                documentGeneration: true,
                complianceValidation: true,
                collaborativeEditing: true,
                submissionStatus: true
            }
        },

        // GovWin Contract Management
        contractManagement: {
            enabled: false,
            api: {
                baseUrl: 'https://contracts.govwin.com/api/v1',
                features: [
                    'contract_tracking',
                    'milestone_management',
                    'performance_monitoring',
                    'renewal_alerts'
                ]
            },
            capabilities: {
                contractTracking: true,
                milestoneAlerts: true,
                performanceMetrics: true,
                renewalManagement: true
            }
        }
    },

    // Third-Party Integrations
    thirdPartyServices: {
        // CRM Systems
        salesforce: {
            enabled: false,
            api: {
                baseUrl: 'https://api.salesforce.com/v1',
                authentication: 'oauth2',
                sandbox: process.env.SALESFORCE_SANDBOX === 'true'
            },
            dataSync: {
                contacts: true,
                opportunities: true,
                accounts: true,
                activities: true
            }
        },

        hubspot: {
            enabled: false,
            api: {
                baseUrl: 'https://api.hubapi.com/v3',
                authentication: 'api_key'
            },
            dataSync: {
                contacts: true,
                companies: true,
                deals: true,
                activities: true
            }
        },

        // Business Intelligence
        powerBI: {
            enabled: false,
            api: {
                baseUrl: 'https://api.powerbi.com/v1.0',
                authentication: 'oauth2'
            },
            capabilities: {
                dataExport: true,
                reportGeneration: true,
                dashboardIntegration: true
            }
        },

        tableau: {
            enabled: false,
            api: {
                baseUrl: 'https://api.tableau.com/v1',
                authentication: 'token'
            },
            capabilities: {
                dataVisualization: true,
                reportSharing: true,
                embeddedAnalytics: true
            }
        },

        // Document Management
        sharepoint: {
            enabled: false,
            api: {
                baseUrl: 'https://graph.microsoft.com/v1.0',
                authentication: 'oauth2'
            },
            capabilities: {
                documentStorage: true,
                documentSharing: true,
                versionControl: true,
                searchIntegration: true
            }
        },

        // Communication Platforms
        microsoftTeams: {
            enabled: true,
            api: {
                baseUrl: 'https://smba.trafficmanager.net/apis',
                authentication: 'bot_framework'
            },
            features: {
                botDeployment: true,
                cardInteractions: true,
                fileSharing: true,
                meetingIntegration: false
            }
        },

        slack: {
            enabled: true,
            api: {
                baseUrl: 'https://slack.com/api',
                authentication: 'oauth2'
            },
            features: {
                botDeployment: true,
                slashCommands: true,
                interactiveComponents: true,
                fileSharing: true
            }
        }
    },

    // Integration Architecture
    architecture: {
        // API Gateway Configuration
        gateway: {
            enabled: true,
            provider: 'aws_api_gateway',
            features: {
                rateLimiting: true,
                authentication: true,
                requestTransformation: true,
                responseTransformation: true,
                caching: true,
                monitoring: true
            },
            cors: {
                enabled: true,
                allowedOrigins: ['https://app.govwin.com'],
                allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
                allowedHeaders: ['Authorization', 'Content-Type']
            }
        },

        // Message Queue
        messageQueue: {
            enabled: true,
            provider: 'aws_sqs',
            queues: {
                webhookEvents: 'govwin-webhook-events',
                dataSync: 'govwin-data-sync',
                notifications: 'govwin-notifications',
                analytics: 'govwin-analytics'
            },
            deadLetterQueue: {
                enabled: true,
                maxRetries: 3
            }
        },

        // Event Streaming
        eventStreaming: {
            enabled: true,
            provider: 'aws_kinesis',
            streams: {
                userInteractions: 'govwin-user-interactions',
                systemEvents: 'govwin-system-events',
                dataChanges: 'govwin-data-changes'
            },
            processing: {
                batchSize: 100,
                batchTimeout: 5000
            }
        },

        // Data Transformation
        dataTransformation: {
            enabled: true,
            provider: 'aws_glue',
            jobs: {
                opportunityETL: 'govwin-opportunity-etl',
                vendorETL: 'govwin-vendor-etl',
                analyticsETL: 'govwin-analytics-etl'
            },
            schedule: {
                fullRefresh: '0 2 * * 0', // Weekly
                incrementalUpdate: '0 */4 * * *' // Every 4 hours
            }
        }
    },

    // Security and Compliance
    security: {
        encryption: {
            inTransit: {
                enabled: true,
                protocol: 'TLS_1_3',
                certificateValidation: true
            },
            atRest: {
                enabled: true,
                algorithm: 'AES-256-GCM',
                keyRotation: 'quarterly'
            }
        },

        accessControl: {
            rbac: {
                enabled: true,
                roles: ['admin', 'user', 'readonly', 'analyst'],
                permissions: {
                    admin: ['read', 'write', 'delete', 'configure'],
                    user: ['read', 'write'],
                    readonly: ['read'],
                    analyst: ['read', 'analyze']
                }
            },
            apiKeys: {
                enabled: true,
                rotation: 'monthly',
                scoping: 'endpoint_based'
            }
        },

        compliance: {
            dataClassification: {
                public: ['opportunity_summaries', 'agency_contacts'],
                internal: ['user_preferences', 'usage_analytics'],
                confidential: ['api_keys', 'user_credentials'],
                restricted: ['financial_data', 'competitive_intelligence']
            },
            auditLogging: {
                enabled: true,
                events: ['api_calls', 'data_access', 'configuration_changes'],
                retention: '7_years',
                immutable: true
            },
            dataGovernance: {
                dataRetention: {
                    userSessions: '90_days',
                    conversationLogs: '1_year',
                    analyticsData: '3_years',
                    auditLogs: '7_years'
                },
                dataMinimization: true,
                consentManagement: true
            }
        }
    },

    // Monitoring and Observability
    monitoring: {
        healthChecks: {
            endpoints: [
                '/health/govwin-api',
                '/health/database',
                '/health/cache',
                '/health/message-queue'
            ],
            interval: 30000,
            timeout: 5000,
            alerting: {
                enabled: true,
                channels: ['slack', 'email', 'pagerduty']
            }
        },

        metrics: {
            integration: {
                apiResponseTime: true,
                apiSuccessRate: true,
                dataFreshness: true,
                syncStatus: true,
                errorRates: true
            },
            business: {
                userEngagement: true,
                featureUsage: true,
                dataQuality: true,
                customerSatisfaction: true
            }
        },

        alerting: {
            rules: [
                {
                    name: 'GovWin API Down',
                    condition: 'govwin_api_success_rate < 0.95',
                    severity: 'critical',
                    channels: ['pagerduty', 'slack']
                },
                {
                    name: 'High Response Time',
                    condition: 'avg_response_time > 5000ms',
                    severity: 'warning',
                    channels: ['slack']
                },
                {
                    name: 'Data Sync Failure',
                    condition: 'data_sync_failures > 3',
                    severity: 'warning',
                    channels: ['email', 'slack']
                }
            ]
        }
    },

    // Feature Flags and Rollout
    featureFlags: {
        enabled: true,
        provider: 'aws_appconfig',
        flags: {
            govwinIntelligenceIntegration: false,
            crmSync: false,
            proposalManagementIntegration: false,
            contractManagementIntegration: false,
            thirdPartyCrmIntegration: false,
            advancedAnalytics: false,
            realTimeNotifications: true,
            webhookProcessing: true
        },
        rolloutStrategy: {
            type: 'gradual',
            stages: [
                { percentage: 5, duration: '1_day' },
                { percentage: 25, duration: '3_days' },
                { percentage: 50, duration: '1_week' },
                { percentage: 100, duration: 'ongoing' }
            ]
        }
    }
};

// Utility functions for integration management
const integrationUtils = {
    // Validate integration configuration
    validateConfig(integrationName) {
        const config = integrationSettings.govwinIQ;
        const required = ['api.baseUrl', 'authentication.clientId', 'authentication.clientSecret'];
        
        const missing = required.filter(path => {
            return !this.getNestedValue(config, path);
        });
        
        if (missing.length > 0) {
            throw new Error(`Missing required configuration for ${integrationName}: ${missing.join(', ')}`);
        }
        
        return true;
    },

    // Get nested configuration value
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    },

    // Generate API client configuration
    generateApiConfig(integrationName) {
        const integration = integrationSettings.govwinIQ;
        
        return {
            baseURL: integration.api.baseUrl,
            timeout: integration.api.timeout,
            retries: integration.api.retries,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'GovWin-IQ-Chatbot/1.0.0'
            },
            auth: {
                type: integration.api.authentication.type,
                clientId: integration.api.authentication.clientId,
                clientSecret: integration.api.authentication.clientSecret,
                scope: integration.api.authentication.scope
            }
        };
    },

    // Get integration endpoints
    getEndpoints(category) {
        return integrationSettings.govwinIQ.endpoints[category] || {};
    },

    // Check feature flag status
    isFeatureEnabled(flagName) {
        return integrationSettings.featureFlags.flags[flagName] || false;
    },

    // Get cache TTL for data type
    getCacheTTL(dataType) {
        return integrationSettings.govwinIQ.caching.ttl[dataType] || 3600;
    }
};

module.exports = {
    integrationSettings,
    integrationUtils,
    validateConfig: integrationUtils.validateConfig.bind(integrationUtils),
    generateApiConfig: integrationUtils.generateApiConfig.bind(integrationUtils),
    getEndpoints: integrationUtils.getEndpoints.bind(integrationUtils),
    isFeatureEnabled: integrationUtils.isFeatureEnabled.bind(integrationUtils),
    getCacheTTL: integrationUtils.getCacheTTL.bind(integrationUtils)
};