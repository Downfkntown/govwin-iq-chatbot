/**
 * Deployment Configuration for GovWin IQ Chatbot
 * Platform-specific deployment configurations and settings
 */

const deploymentConfig = {
    version: '1.0.0',
    lastUpdated: '2025-09-09',

    // Common deployment settings
    common: {
        nodeVersion: '18.x',
        timezone: 'UTC',
        maxMemory: '512MB',
        timeout: 30,
        healthCheck: {
            enabled: true,
            path: '/health',
            interval: 30,
            timeout: 10
        },
        monitoring: {
            enabled: true,
            metricsPath: '/metrics',
            logsRetentionDays: 30
        }
    },

    // Development environment
    development: {
        platform: 'local',
        domain: 'localhost:3000',
        ssl: false,
        scaling: {
            instances: 1,
            autoScale: false
        },
        database: {
            host: 'localhost',
            port: 27017,
            name: 'govwin-iq-chatbot-dev'
        },
        redis: {
            host: 'localhost',
            port: 6379,
            db: 0
        },
        assets: {
            serve: 'local',
            compression: false,
            caching: false
        },
        debugging: {
            enabled: true,
            verbose: true,
            inspector: true
        }
    },

    // Staging environment
    staging: {
        platform: 'heroku',
        domain: 'govwin-iq-chatbot-staging.herokuapp.com',
        ssl: true,
        scaling: {
            instances: 1,
            autoScale: false,
            dynoType: 'standard-1x'
        },
        database: {
            provider: 'mongodb_atlas',
            cluster: 'staging-cluster',
            authSource: 'admin'
        },
        redis: {
            provider: 'heroku_redis',
            plan: 'mini'
        },
        assets: {
            serve: 'cdn',
            compression: true,
            caching: true,
            cdnProvider: 'cloudflare'
        },
        buildpacks: [
            'heroku/nodejs'
        ],
        addons: [
            'heroku-redis:mini',
            'papertrail:choklad'
        ],
        configVars: {
            NODE_ENV: 'staging',
            NPM_CONFIG_PRODUCTION: 'false'
        }
    },

    // Production environment
    production: {
        platform: 'aws',
        domain: 'chatbot.govwin.com',
        ssl: true,
        scaling: {
            instances: 3,
            autoScale: true,
            minInstances: 2,
            maxInstances: 10,
            targetCpu: 70
        },
        database: {
            provider: 'aws_documentdb',
            cluster: 'prod-cluster',
            multiAz: true,
            backupRetention: 7
        },
        redis: {
            provider: 'aws_elasticache',
            nodeType: 'cache.t3.micro',
            numNodes: 2
        },
        assets: {
            serve: 'cdn',
            compression: true,
            caching: true,
            cdnProvider: 'aws_cloudfront'
        },
        loadBalancer: {
            enabled: true,
            type: 'application',
            healthCheck: {
                path: '/health',
                interval: 30,
                timeout: 5,
                healthyThreshold: 2
            }
        },
        security: {
            waf: true,
            ddosProtection: true,
            ipWhitelist: [],
            rateLimiting: true
        }
    },

    // Docker configuration
    docker: {
        baseImage: 'node:18-alpine',
        workdir: '/app',
        port: 3000,
        user: 'node',
        healthCheck: {
            test: ['CMD', 'curl', '-f', 'http://localhost:3000/health'],
            interval: '30s',
            timeout: '10s',
            retries: 3,
            startPeriod: '40s'
        },
        buildStages: {
            dependencies: {
                copyFiles: ['package*.json'],
                runCommands: ['npm ci --only=production && npm cache clean --force']
            },
            application: {
                copyFiles: ['.'],
                excludeFiles: [
                    'node_modules',
                    'npm-debug.log',
                    '.git',
                    '.gitignore',
                    'README.md',
                    'Dockerfile',
                    '.dockerignore'
                ]
            }
        },
        environment: {
            NODE_ENV: 'production',
            NPM_CONFIG_LOGLEVEL: 'warn'
        }
    },

    // Kubernetes configuration
    kubernetes: {
        namespace: 'govwin-chatbot',
        deployment: {
            replicas: 3,
            strategy: {
                type: 'RollingUpdate',
                rollingUpdate: {
                    maxUnavailable: 1,
                    maxSurge: 1
                }
            },
            containers: {
                image: 'govwin/iq-chatbot:latest',
                port: 3000,
                resources: {
                    requests: {
                        memory: '256Mi',
                        cpu: '250m'
                    },
                    limits: {
                        memory: '512Mi',
                        cpu: '500m'
                    }
                },
                livenessProbe: {
                    httpGet: {
                        path: '/health',
                        port: 3000
                    },
                    initialDelaySeconds: 30,
                    periodSeconds: 10
                },
                readinessProbe: {
                    httpGet: {
                        path: '/ready',
                        port: 3000
                    },
                    initialDelaySeconds: 5,
                    periodSeconds: 5
                }
            }
        },
        service: {
            type: 'ClusterIP',
            port: 80,
            targetPort: 3000
        },
        ingress: {
            enabled: true,
            className: 'nginx',
            annotations: {
                'kubernetes.io/ingress.class': 'nginx',
                'cert-manager.io/cluster-issuer': 'letsencrypt-prod',
                'nginx.ingress.kubernetes.io/rate-limit': '100'
            },
            tls: true
        },
        configMap: 'chatbot-config',
        secrets: ['chatbot-secrets'],
        volumes: [
            {
                name: 'logs',
                emptyDir: {}
            }
        ]
    },

    // Serverless configuration (AWS Lambda)
    serverless: {
        provider: 'aws',
        runtime: 'nodejs18.x',
        region: 'us-east-1',
        stage: '${opt:stage, "dev"}',
        memorySize: 512,
        timeout: 30,
        environment: {
            NODE_ENV: '${self:provider.stage}',
            STAGE: '${self:provider.stage}'
        },
        functions: {
            chatbot: {
                handler: 'src/lambda.handler',
                events: [
                    {
                        http: {
                            path: '/{proxy+}',
                            method: 'ANY',
                            cors: true
                        }
                    }
                ]
            },
            scheduler: {
                handler: 'src/scheduler.handler',
                events: [
                    {
                        schedule: 'rate(5 minutes)'
                    }
                ]
            }
        },
        plugins: [
            'serverless-offline',
            'serverless-dotenv-plugin',
            'serverless-prune-plugin'
        ],
        custom: {
            prune: {
                automatic: true,
                number: 3
            }
        }
    },

    // CI/CD Pipeline configuration
    cicd: {
        github: {
            workflows: {
                test: {
                    on: ['push', 'pull_request'],
                    runs: ['lint', 'test', 'security-scan'],
                    nodeVersions: ['16.x', '18.x'],
                    services: ['mongodb', 'redis']
                },
                deploy: {
                    on: ['push'],
                    branches: ['main'],
                    environments: ['staging', 'production'],
                    approvalRequired: {
                        production: true
                    }
                }
            }
        },
        jenkins: {
            pipeline: {
                stages: [
                    'checkout',
                    'install-deps',
                    'lint',
                    'test',
                    'build',
                    'security-scan',
                    'deploy-staging',
                    'integration-test',
                    'deploy-production'
                ],
                parallel: {
                    test: ['unit-test', 'integration-test'],
                    scan: ['security-scan', 'dependency-scan']
                }
            }
        }
    },

    // Monitoring and logging
    observability: {
        logging: {
            driver: 'json-file',
            options: {
                'max-size': '10m',
                'max-file': '3'
            },
            aggregation: {
                tool: 'elk',
                retention: '30d'
            }
        },
        metrics: {
            prometheus: {
                enabled: true,
                path: '/metrics',
                scrapeInterval: '15s'
            },
            customMetrics: [
                'conversation_count',
                'response_time',
                'intent_accuracy',
                'escalation_rate'
            ]
        },
        tracing: {
            enabled: true,
            sampler: 0.1,
            jaeger: {
                endpoint: 'http://jaeger:14268/api/traces'
            }
        },
        alerting: {
            rules: [
                {
                    alert: 'HighResponseTime',
                    condition: 'avg_response_time > 2000ms',
                    duration: '5m'
                },
                {
                    alert: 'HighErrorRate',
                    condition: 'error_rate > 5%',
                    duration: '2m'
                }
            ]
        }
    },

    // Backup and disaster recovery
    backup: {
        database: {
            schedule: '0 2 * * *',
            retention: '30d',
            encryption: true,
            crossRegion: true
        },
        files: {
            schedule: '0 3 * * *',
            retention: '7d',
            compression: true
        },
        testing: {
            schedule: 'monthly',
            automated: true
        }
    }
};

// Utility functions for deployment
const deploymentUtils = {
    getConfig(environment) {
        return {
            ...deploymentConfig.common,
            ...deploymentConfig[environment]
        };
    },

    validateConfig(config) {
        const required = ['platform', 'domain'];
        const missing = required.filter(key => !config[key]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required deployment config: ${missing.join(', ')}`);
        }
        
        return true;
    },

    generateDockerfile(environment = 'production') {
        const config = this.getConfig(environment);
        return `
FROM ${deploymentConfig.docker.baseImage}
WORKDIR ${deploymentConfig.docker.workdir}
USER ${deploymentConfig.docker.user}

COPY package*.json ./
RUN ${deploymentConfig.docker.buildStages.dependencies.runCommands.join(' && ')}

COPY . .
EXPOSE ${deploymentConfig.docker.port}

HEALTHCHECK --interval=${deploymentConfig.docker.healthCheck.interval} \\
            --timeout=${deploymentConfig.docker.healthCheck.timeout} \\
            --start-period=${deploymentConfig.docker.healthCheck.startPeriod} \\
            --retries=${deploymentConfig.docker.healthCheck.retries} \\
            CMD ${deploymentConfig.docker.healthCheck.test.join(' ')}

CMD ["npm", "start"]
        `.trim();
    },

    generateKubernetesManifests() {
        const k8s = deploymentConfig.kubernetes;
        return {
            deployment: {
                apiVersion: 'apps/v1',
                kind: 'Deployment',
                metadata: {
                    name: 'govwin-iq-chatbot',
                    namespace: k8s.namespace
                },
                spec: {
                    replicas: k8s.deployment.replicas,
                    strategy: k8s.deployment.strategy,
                    selector: {
                        matchLabels: {
                            app: 'govwin-iq-chatbot'
                        }
                    },
                    template: {
                        metadata: {
                            labels: {
                                app: 'govwin-iq-chatbot'
                            }
                        },
                        spec: {
                            containers: [{
                                name: 'chatbot',
                                image: k8s.deployment.containers.image,
                                ports: [{
                                    containerPort: k8s.deployment.containers.port
                                }],
                                resources: k8s.deployment.containers.resources,
                                livenessProbe: k8s.deployment.containers.livenessProbe,
                                readinessProbe: k8s.deployment.containers.readinessProbe
                            }]
                        }
                    }
                }
            },
            service: {
                apiVersion: 'v1',
                kind: 'Service',
                metadata: {
                    name: 'govwin-iq-chatbot-service',
                    namespace: k8s.namespace
                },
                spec: {
                    type: k8s.service.type,
                    ports: [{
                        port: k8s.service.port,
                        targetPort: k8s.service.targetPort
                    }],
                    selector: {
                        app: 'govwin-iq-chatbot'
                    }
                }
            }
        };
    }
};

module.exports = {
    deploymentConfig,
    deploymentUtils,
    getConfig: deploymentUtils.getConfig.bind(deploymentUtils),
    validateConfig: deploymentUtils.validateConfig.bind(deploymentUtils),
    generateDockerfile: deploymentUtils.generateDockerfile.bind(deploymentUtils),
    generateKubernetesManifests: deploymentUtils.generateKubernetesManifests.bind(deploymentUtils)
};