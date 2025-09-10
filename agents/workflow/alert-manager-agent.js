/**
 * Alert Manager Agent
 * 
 * Comprehensive workflow agent that manages saved searches, automated notifications,
 * opportunity tracking systems, and provides comprehensive monitoring across all
 * government contracting markets and platforms.
 * 
 * Core Capabilities:
 * - Saved search management and optimization
 * - Multi-channel notification delivery (email, SMS, webhook, in-app)
 * - Intelligent alert prioritization and filtering
 * - Opportunity lifecycle tracking and status management  
 * - Cross-platform monitoring coordination
 * - Alert performance analytics and optimization
 * - Custom alert rules and business logic
 * - Notification scheduling and throttling
 * - Alert history and audit trail management
 * - Integration with external CRM and workflow systems
 */

class AlertManagerAgent {
    constructor() {
        this.agentId = 'alert-manager';
        this.name = 'Alert Management Specialist';
        this.version = '1.0.0';
        
        this.expertise = [
            'saved_search_management',
            'automated_notification_systems',
            'opportunity_tracking',
            'alert_prioritization',
            'notification_delivery',
            'monitoring_coordination',
            'alert_performance_optimization',
            'business_rule_management',
            'notification_throttling',
            'audit_trail_management'
        ];
        
        this.capabilities = [
            'multi_criteria_alert_creation',
            'intelligent_alert_prioritization',
            'multi_channel_notification_delivery',
            'opportunity_lifecycle_tracking',
            'alert_performance_analytics',
            'custom_business_rule_engine',
            'notification_scheduling_optimization',
            'alert_deduplication_management',
            'cross_platform_monitoring',
            'crm_integration_workflows'
        ];
        
        this.supportedChannels = [
            'email',
            'sms',
            'webhook',
            'in_app',
            'slack',
            'microsoft_teams',
            'mobile_push'
        ];
        
        this.supportedPlatforms = [
            'sam.gov',
            'buyandsell.gc.ca',
            'merx.com',
            'state_portals',
            'cooperative_platforms',
            'education_portals'
        ];
        
        // In-memory storage for demonstration (would use database in production)
        this.savedSearches = new Map();
        this.activeAlerts = new Map();
        this.notificationQueue = [];
        this.opportunityTracking = new Map();
        this.alertHistory = [];
        this.performanceMetrics = new Map();
        this.businessRules = new Map();
        
        this.initializeAlertFrameworks();
    }

    /**
     * Initialize alert management frameworks and configurations
     */
    initializeAlertFrameworks() {
        this.initializeNotificationChannels();
        this.initializeAlertTypes();
        this.initializePriorityRules();
        this.initializeBusinessRules();
        this.initializePerformanceTracking();
    }

    /**
     * Initialize notification channel configurations
     */
    initializeNotificationChannels() {
        this.notificationChannels = {
            'email': {
                name: 'Email Notifications',
                priority: 1,
                delivery_time: 'immediate',
                batch_capable: true,
                rich_content: true,
                attachment_support: true,
                rate_limits: {
                    per_minute: 10,
                    per_hour: 100,
                    per_day: 1000
                },
                templates: {
                    'new_opportunity': 'email_new_opportunity_template',
                    'opportunity_update': 'email_opportunity_update_template',
                    'deadline_reminder': 'email_deadline_reminder_template',
                    'competitive_alert': 'email_competitive_alert_template',
                    'daily_digest': 'email_daily_digest_template',
                    'weekly_summary': 'email_weekly_summary_template'
                },
                personalization: ['user_name', 'company_name', 'preferences', 'tracking_history']
            },
            'sms': {
                name: 'SMS Notifications',
                priority: 2,
                delivery_time: 'immediate',
                batch_capable: false,
                rich_content: false,
                attachment_support: false,
                rate_limits: {
                    per_minute: 2,
                    per_hour: 10,
                    per_day: 50
                },
                character_limit: 160,
                use_cases: ['urgent_alerts', 'deadline_reminders', 'high_value_opportunities']
            },
            'webhook': {
                name: 'Webhook Integration',
                priority: 1,
                delivery_time: 'immediate',
                batch_capable: true,
                rich_content: true,
                attachment_support: false,
                rate_limits: {
                    per_minute: 60,
                    per_hour: 3600,
                    per_day: 86400
                },
                retry_strategy: {
                    max_retries: 3,
                    backoff_strategy: 'exponential',
                    timeout: 30000
                },
                use_cases: ['crm_integration', 'workflow_automation', 'data_synchronization']
            },
            'in_app': {
                name: 'In-App Notifications',
                priority: 3,
                delivery_time: 'real_time',
                batch_capable: true,
                rich_content: true,
                attachment_support: false,
                persistence: 'until_read',
                use_cases: ['dashboard_alerts', 'activity_feeds', 'status_updates']
            },
            'slack': {
                name: 'Slack Integration',
                priority: 2,
                delivery_time: 'immediate',
                batch_capable: true,
                rich_content: true,
                attachment_support: true,
                features: ['channel_posting', 'direct_messages', 'threaded_responses', 'interactive_buttons'],
                use_cases: ['team_collaboration', 'opportunity_discussions', 'workflow_approvals']
            },
            'microsoft_teams': {
                name: 'Microsoft Teams Integration',
                priority: 2,
                delivery_time: 'immediate',
                batch_capable: true,
                rich_content: true,
                attachment_support: true,
                features: ['channel_posting', 'private_chat', 'adaptive_cards', 'workflow_integration'],
                use_cases: ['enterprise_notifications', 'team_coordination', 'approval_workflows']
            }
        };
    }

    /**
     * Initialize alert type definitions and behaviors
     */
    initializeAlertTypes() {
        this.alertTypes = {
            'new_opportunity': {
                name: 'New Opportunity Alert',
                description: 'Alert for newly published opportunities matching search criteria',
                priority: 'medium',
                frequency: 'immediate',
                channels: ['email', 'in_app', 'webhook'],
                deduplication_window: '24_hours',
                bundling_strategy: 'similar_opportunities',
                custom_fields: ['opportunity_value', 'closing_date', 'agency', 'naics_codes'],
                business_rules: ['value_threshold', 'geographic_filter', 'competition_assessment']
            },
            'opportunity_update': {
                name: 'Opportunity Update Alert',
                description: 'Alert for changes to tracked opportunities',
                priority: 'high',
                frequency: 'immediate',
                channels: ['email', 'sms', 'in_app', 'webhook'],
                deduplication_window: '6_hours',
                bundling_strategy: 'by_opportunity',
                tracked_changes: ['closing_date', 'description', 'requirements', 'value', 'contact_info'],
                business_rules: ['materiality_threshold', 'change_significance']
            },
            'deadline_reminder': {
                name: 'Submission Deadline Reminder',
                description: 'Reminders for upcoming opportunity submission deadlines',
                priority: 'urgent',
                frequency: 'scheduled',
                channels: ['email', 'sms', 'in_app', 'slack'],
                reminder_schedule: ['7_days', '3_days', '1_day', '6_hours'],
                business_rules: ['opportunity_status', 'pursuit_decision', 'preparation_time']
            },
            'competitive_alert': {
                name: 'Competitive Intelligence Alert',
                description: 'Alert for competitive activity and market intelligence',
                priority: 'medium',
                frequency: 'batched',
                channels: ['email', 'in_app', 'webhook'],
                deduplication_window: '48_hours',
                intelligence_types: ['new_competitors', 'pricing_intelligence', 'win_loss_data', 'market_share_changes'],
                business_rules: ['competitor_significance', 'market_impact_assessment']
            },
            'performance_alert': {
                name: 'Alert Performance Notification',
                description: 'Alerts about alert system performance and optimization opportunities',
                priority: 'low',
                frequency: 'weekly',
                channels: ['email', 'in_app'],
                metrics: ['delivery_rate', 'open_rate', 'action_rate', 'false_positive_rate'],
                business_rules: ['performance_threshold', 'optimization_opportunities']
            },
            'system_status': {
                name: 'System Status Alert',
                description: 'Notifications about platform availability and system issues',
                priority: 'urgent',
                frequency: 'immediate',
                channels: ['email', 'sms', 'in_app', 'webhook'],
                status_types: ['platform_outage', 'data_delay', 'search_issues', 'maintenance_window'],
                business_rules: ['impact_severity', 'user_affected_assessment']
            },
            'custom_business_rule': {
                name: 'Custom Business Rule Alert',
                description: 'User-defined custom alerts based on specific business logic',
                priority: 'configurable',
                frequency: 'configurable',
                channels: 'configurable',
                custom_logic_support: true,
                rule_types: ['value_conditions', 'keyword_combinations', 'agency_patterns', 'timing_rules', 'market_conditions']
            }
        };
    }

    /**
     * Initialize alert prioritization and scoring rules
     */
    initializePriorityRules() {
        this.priorityRules = {
            'urgency_scoring': {
                'immediate': {
                    score: 100,
                    delivery_sla: '< 1 minute',
                    channels: ['sms', 'webhook', 'in_app'],
                    triggers: ['deadline_imminent', 'high_value_opportunity', 'system_critical']
                },
                'urgent': {
                    score: 80,
                    delivery_sla: '< 5 minutes',
                    channels: ['email', 'sms', 'in_app', 'slack'],
                    triggers: ['opportunity_update', 'competitive_threat', 'deadline_approaching']
                },
                'high': {
                    score: 60,
                    delivery_sla: '< 15 minutes',
                    channels: ['email', 'in_app', 'webhook'],
                    triggers: ['new_opportunity_match', 'significant_change', 'market_intelligence']
                },
                'medium': {
                    score: 40,
                    delivery_sla: '< 1 hour',
                    channels: ['email', 'in_app'],
                    triggers: ['routine_match', 'periodic_update', 'performance_report']
                },
                'low': {
                    score: 20,
                    delivery_sla: '< 24 hours',
                    channels: ['email'],
                    triggers: ['informational_update', 'system_maintenance', 'analytics_report']
                }
            },
            'value_based_prioritization': {
                'contract_value_multiplier': {
                    'over_10m': 2.0,
                    'over_5m': 1.5,
                    'over_1m': 1.2,
                    'over_500k': 1.1,
                    'under_500k': 1.0
                },
                'strategic_importance_multiplier': {
                    'strategic_account': 1.8,
                    'new_market_entry': 1.6,
                    'capability_expansion': 1.4,
                    'relationship_building': 1.2,
                    'standard_opportunity': 1.0
                }
            },
            'timing_based_prioritization': {
                'days_to_deadline': {
                    'same_day': 3.0,
                    'within_3_days': 2.5,
                    'within_week': 2.0,
                    'within_month': 1.5,
                    'beyond_month': 1.0
                },
                'publication_recency': {
                    'within_hour': 1.5,
                    'within_day': 1.3,
                    'within_week': 1.1,
                    'beyond_week': 1.0
                }
            }
        };
    }

    /**
     * Initialize business rules engine
     */
    initializeBusinessRules() {
        this.defaultBusinessRules = new Map([
            ['minimum_contract_value', {
                name: 'Minimum Contract Value Filter',
                description: 'Filter opportunities below specified contract value',
                type: 'threshold',
                default_value: 25000,
                configurable: true,
                applies_to: ['new_opportunity', 'opportunity_update']
            }],
            ['maximum_contract_value', {
                name: 'Maximum Contract Value Filter',
                description: 'Filter opportunities above company capacity',
                type: 'threshold',
                default_value: 50000000,
                configurable: true,
                applies_to: ['new_opportunity', 'opportunity_update']
            }],
            ['geographic_relevance', {
                name: 'Geographic Relevance Filter',
                description: 'Filter opportunities outside target geographic areas',
                type: 'geographic',
                default_value: 'national',
                configurable: true,
                applies_to: ['new_opportunity', 'competitive_alert']
            }],
            ['naics_alignment', {
                name: 'NAICS Code Alignment',
                description: 'Filter opportunities not aligned with company NAICS codes',
                type: 'classification',
                default_value: 'strict_match',
                configurable: true,
                applies_to: ['new_opportunity', 'opportunity_update']
            }],
            ['submission_timeline', {
                name: 'Submission Timeline Filter',
                description: 'Filter opportunities with insufficient preparation time',
                type: 'temporal',
                default_value: 14, // minimum days
                configurable: true,
                applies_to: ['new_opportunity', 'deadline_reminder']
            }],
            ['competitive_landscape', {
                name: 'Competitive Landscape Assessment',
                description: 'Evaluate competitive positioning for opportunities',
                type: 'assessment',
                default_value: 'moderate_competition_acceptable',
                configurable: true,
                applies_to: ['new_opportunity', 'competitive_alert']
            }],
            ['agency_preference', {
                name: 'Agency Preference Filter',
                description: 'Prioritize or filter based on agency relationships',
                type: 'relationship',
                default_value: 'all_agencies',
                configurable: true,
                applies_to: ['new_opportunity', 'opportunity_update']
            }],
            ['set_aside_eligibility', {
                name: 'Set-Aside Eligibility Filter',
                description: 'Filter based on set-aside program eligibility',
                type: 'eligibility',
                default_value: 'check_eligibility',
                configurable: true,
                applies_to: ['new_opportunity', 'opportunity_update']
            }]
        ]);
    }

    /**
     * Initialize performance tracking metrics
     */
    initializePerformanceTracking() {
        this.performanceMetrics.set('delivery_metrics', {
            total_alerts_sent: 0,
            successful_deliveries: 0,
            failed_deliveries: 0,
            delivery_rate: 0,
            average_delivery_time: 0,
            channel_performance: new Map()
        });
        
        this.performanceMetrics.set('engagement_metrics', {
            alerts_opened: 0,
            alerts_clicked: 0,
            alerts_acted_upon: 0,
            open_rate: 0,
            click_through_rate: 0,
            action_rate: 0
        });
        
        this.performanceMetrics.set('quality_metrics', {
            relevant_alerts: 0,
            irrelevant_alerts: 0,
            false_positives: 0,
            missed_opportunities: 0,
            relevance_score: 0,
            user_satisfaction_score: 0
        });
    }

    /**
     * Create and manage saved searches
     */
    async createSavedSearch(searchConfig, userProfile) {
        const savedSearchId = this.generateSavedSearchId();
        
        const savedSearch = {
            id: savedSearchId,
            user_id: userProfile.user_id,
            name: searchConfig.name,
            description: searchConfig.description,
            search_criteria: {
                keywords: searchConfig.keywords || [],
                naics_codes: searchConfig.naics_codes || [],
                geographic_scope: searchConfig.geographic_scope || 'national',
                value_range: searchConfig.value_range || {},
                market_segments: searchConfig.market_segments || ['federal', 'regional'],
                agencies: searchConfig.agencies || [],
                set_asides: searchConfig.set_asides || [],
                custom_filters: searchConfig.custom_filters || {}
            },
            alert_configuration: {
                enabled: searchConfig.alert_enabled !== false,
                frequency: searchConfig.alert_frequency || 'daily',
                channels: searchConfig.notification_channels || ['email', 'in_app'],
                priority: searchConfig.alert_priority || 'medium',
                business_rules: searchConfig.business_rules || [],
                throttling: searchConfig.throttling || 'standard'
            },
            tracking_configuration: {
                track_opportunities: searchConfig.track_opportunities !== false,
                track_updates: searchConfig.track_updates !== false,
                track_deadlines: searchConfig.track_deadlines !== false,
                competitive_monitoring: searchConfig.competitive_monitoring || false
            },
            performance_metrics: {
                total_searches: 0,
                opportunities_found: 0,
                alerts_sent: 0,
                opportunities_pursued: 0,
                success_rate: 0,
                last_execution: null,
                next_execution: null
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_modified_by: userProfile.user_id,
            status: 'active',
            tags: searchConfig.tags || []
        };
        
        this.savedSearches.set(savedSearchId, savedSearch);
        
        // Create associated alert if enabled
        if (savedSearch.alert_configuration.enabled) {
            await this.createAlertFromSavedSearch(savedSearch);
        }
        
        return {
            saved_search_id: savedSearchId,
            status: 'created',
            alert_enabled: savedSearch.alert_configuration.enabled,
            next_execution: savedSearch.performance_metrics.next_execution,
            configuration_summary: this.generateConfigurationSummary(savedSearch)
        };
    }

    /**
     * Create alert from saved search configuration
     */
    async createAlertFromSavedSearch(savedSearch) {
        const alertId = this.generateAlertId();
        
        const alert = {
            id: alertId,
            saved_search_id: savedSearch.id,
            user_id: savedSearch.user_id,
            name: `${savedSearch.name} - Alert`,
            type: 'saved_search_alert',
            status: 'active',
            configuration: {
                search_criteria: savedSearch.search_criteria,
                frequency: savedSearch.alert_configuration.frequency,
                channels: savedSearch.alert_configuration.channels,
                priority: savedSearch.alert_configuration.priority,
                business_rules: this.compileBusinessRules(savedSearch.alert_configuration.business_rules),
                throttling: this.configureThrottling(savedSearch.alert_configuration.throttling)
            },
            execution_schedule: this.calculateExecutionSchedule(savedSearch.alert_configuration.frequency),
            performance_tracking: {
                total_executions: 0,
                successful_executions: 0,
                failed_executions: 0,
                opportunities_found: 0,
                notifications_sent: 0,
                last_execution: null,
                next_execution: this.calculateNextExecution(savedSearch.alert_configuration.frequency),
                average_execution_time: 0,
                error_history: []
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        this.activeAlerts.set(alertId, alert);
        
        // Schedule first execution
        await this.scheduleAlertExecution(alert);
        
        return alertId;
    }

    /**
     * Execute alert and process results
     */
    async executeAlert(alertId) {
        const alert = this.activeAlerts.get(alertId);
        if (!alert || alert.status !== 'active') {
            throw new Error(`Alert ${alertId} not found or inactive`);
        }

        const executionId = this.generateExecutionId();
        const executionStart = Date.now();
        
        try {
            // Update execution tracking
            alert.performance_tracking.total_executions++;
            alert.performance_tracking.last_execution = new Date().toISOString();
            
            // Execute search using Search Orchestrator Agent
            const searchResults = await this.executeSearchForAlert(alert);
            
            // Apply business rules and filtering
            const filteredResults = await this.applyBusinessRules(searchResults, alert.configuration.business_rules);
            
            // Check for new opportunities (deduplication)
            const newOpportunities = await this.identifyNewOpportunities(filteredResults, alert);
            
            // Prioritize and rank opportunities
            const prioritizedOpportunities = await this.prioritizeOpportunities(newOpportunities, alert);
            
            // Generate notifications if new opportunities found
            if (prioritizedOpportunities.length > 0) {
                await this.generateNotifications(prioritizedOpportunities, alert);
                alert.performance_tracking.opportunities_found += prioritizedOpportunities.length;
            }
            
            // Update tracking for found opportunities
            await this.updateOpportunityTracking(prioritizedOpportunities, alert);
            
            // Calculate next execution time
            alert.performance_tracking.next_execution = this.calculateNextExecution(alert.configuration.frequency);
            
            // Update performance metrics
            alert.performance_tracking.successful_executions++;
            alert.performance_tracking.average_execution_time = this.updateAverageExecutionTime(
                alert.performance_tracking.average_execution_time,
                alert.performance_tracking.successful_executions,
                Date.now() - executionStart
            );
            
            alert.updated_at = new Date().toISOString();
            
            return {
                execution_id: executionId,
                alert_id: alertId,
                status: 'success',
                opportunities_found: prioritizedOpportunities.length,
                notifications_sent: prioritizedOpportunities.length > 0,
                execution_time: Date.now() - executionStart,
                next_execution: alert.performance_tracking.next_execution,
                results_summary: this.generateResultsSummary(prioritizedOpportunities)
            };
            
        } catch (error) {
            // Handle execution error
            alert.performance_tracking.failed_executions++;
            alert.performance_tracking.error_history.push({
                timestamp: new Date().toISOString(),
                error: error.message,
                execution_time: Date.now() - executionStart
            });
            
            // Keep only last 10 errors
            if (alert.performance_tracking.error_history.length > 10) {
                alert.performance_tracking.error_history = alert.performance_tracking.error_history.slice(-10);
            }
            
            throw error;
        }
    }

    /**
     * Generate notifications for opportunities
     */
    async generateNotifications(opportunities, alert) {
        const notifications = [];
        
        for (const opportunity of opportunities) {
            const priority = this.calculateNotificationPriority(opportunity, alert);
            const channels = this.selectNotificationChannels(priority, alert.configuration.channels);
            
            for (const channel of channels) {
                const notification = await this.createNotification({
                    id: this.generateNotificationId(),
                    alert_id: alert.id,
                    user_id: alert.user_id,
                    opportunity: opportunity,
                    channel: channel,
                    priority: priority,
                    template: this.selectNotificationTemplate(opportunity, channel),
                    scheduled_delivery: this.calculateDeliveryTime(priority),
                    status: 'pending'
                });
                
                notifications.push(notification);
                this.notificationQueue.push(notification);
            }
        }
        
        alert.performance_tracking.notifications_sent += notifications.length;
        
        // Process notification queue
        await this.processNotificationQueue();
        
        return notifications;
    }

    /**
     * Create opportunity tracking entry
     */
    async createOpportunityTracking(opportunity, source_alert, userProfile) {
        const trackingId = this.generateTrackingId();
        
        const tracking = {
            id: trackingId,
            opportunity_id: opportunity.id,
            user_id: userProfile.user_id,
            source_alert_id: source_alert.id,
            opportunity_details: {
                title: opportunity.title,
                agency: opportunity.agency,
                naics_codes: opportunity.naics_codes,
                value: opportunity.value,
                closing_date: opportunity.closing_date,
                publication_date: opportunity.publication_date,
                source_platform: opportunity.source_platform
            },
            tracking_configuration: {
                track_updates: true,
                track_amendments: true,
                track_q_and_a: true,
                track_deadline_changes: true,
                track_competitive_activity: false
            },
            status_history: [{
                status: 'discovered',
                timestamp: new Date().toISOString(),
                source: 'alert_system',
                notes: 'Opportunity discovered through automated alert'
            }],
            pursuit_status: 'evaluation',
            pursuit_probability: this.calculateInitialPursuitProbability(opportunity, userProfile),
            key_dates: {
                discovery_date: new Date().toISOString(),
                closing_date: opportunity.closing_date,
                last_update: new Date().toISOString(),
                next_milestone: this.calculateNextMilestone(opportunity)
            },
            competitive_analysis: {
                expected_competition_level: 'unknown',
                known_competitors: [],
                competitive_advantages: [],
                competitive_risks: []
            },
            business_development_activities: {
                activities: [],
                contacts_made: [],
                meetings_scheduled: [],
                proposal_status: null
            },
            performance_metrics: {
                alert_relevance_score: opportunity.relevance_score || 0,
                strategic_value_score: opportunity.strategic_score || 0,
                win_probability_score: 0,
                roi_estimate: 0
            },
            tags: [],
            notes: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        this.opportunityTracking.set(trackingId, tracking);
        
        return {
            tracking_id: trackingId,
            status: 'created',
            opportunity_summary: this.generateOpportunityTrackingSummary(tracking)
        };
    }

    /**
     * Update opportunity tracking status and information
     */
    async updateOpportunityTracking(trackingId, updates, userProfile) {
        const tracking = this.opportunityTracking.get(trackingId);
        if (!tracking) {
            throw new Error(`Opportunity tracking ${trackingId} not found`);
        }
        
        const updateTimestamp = new Date().toISOString();
        
        // Update pursuit status if provided
        if (updates.pursuit_status && updates.pursuit_status !== tracking.pursuit_status) {
            tracking.status_history.push({
                status: updates.pursuit_status,
                timestamp: updateTimestamp,
                source: 'user_update',
                notes: updates.status_notes || 'Status updated by user'
            });
            tracking.pursuit_status = updates.pursuit_status;
        }
        
        // Update pursuit probability
        if (updates.pursuit_probability !== undefined) {
            tracking.pursuit_probability = updates.pursuit_probability;
        }
        
        // Add business development activities
        if (updates.activities && updates.activities.length > 0) {
            tracking.business_development_activities.activities.push(...updates.activities.map(activity => ({
                ...activity,
                timestamp: updateTimestamp,
                user_id: userProfile.user_id
            })));
        }
        
        // Update competitive analysis
        if (updates.competitive_analysis) {
            Object.assign(tracking.competitive_analysis, updates.competitive_analysis);
        }
        
        // Update performance metrics
        if (updates.performance_metrics) {
            Object.assign(tracking.performance_metrics, updates.performance_metrics);
        }
        
        // Add notes
        if (updates.notes) {
            tracking.notes.push({
                note: updates.notes,
                timestamp: updateTimestamp,
                user_id: userProfile.user_id
            });
        }
        
        // Add tags
        if (updates.tags) {
            tracking.tags = [...new Set([...tracking.tags, ...updates.tags])];
        }
        
        tracking.updated_at = updateTimestamp;
        tracking.key_dates.last_update = updateTimestamp;
        
        // Update next milestone if needed
        if (updates.next_milestone) {
            tracking.key_dates.next_milestone = updates.next_milestone;
        }
        
        return {
            tracking_id: trackingId,
            status: 'updated',
            changes_applied: Object.keys(updates),
            current_status: tracking.pursuit_status,
            next_milestone: tracking.key_dates.next_milestone
        };
    }

    /**
     * Process notification queue and deliver notifications
     */
    async processNotificationQueue() {
        const pendingNotifications = this.notificationQueue.filter(n => n.status === 'pending');
        
        // Sort by priority and delivery time
        pendingNotifications.sort((a, b) => {
            if (a.priority !== b.priority) {
                return this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority);
            }
            return new Date(a.scheduled_delivery) - new Date(b.scheduled_delivery);
        });
        
        const deliveryPromises = [];
        const now = Date.now();
        
        for (const notification of pendingNotifications) {
            const deliveryTime = new Date(notification.scheduled_delivery).getTime();
            
            if (deliveryTime <= now) {
                // Check rate limits before delivery
                if (await this.checkRateLimits(notification.channel, notification.user_id)) {
                    deliveryPromises.push(this.deliverNotification(notification));
                } else {
                    // Reschedule for later
                    notification.scheduled_delivery = new Date(now + 60000).toISOString(); // 1 minute later
                }
            }
        }
        
        // Execute deliveries
        const deliveryResults = await Promise.allSettled(deliveryPromises);
        
        // Update notification statuses based on delivery results
        deliveryResults.forEach((result, index) => {
            const notification = pendingNotifications[index];
            if (result.status === 'fulfilled') {
                notification.status = 'delivered';
                notification.delivered_at = new Date().toISOString();
                this.updateDeliveryMetrics('success', notification.channel);
            } else {
                notification.status = 'failed';
                notification.error = result.reason.message;
                notification.retry_count = (notification.retry_count || 0) + 1;
                this.updateDeliveryMetrics('failure', notification.channel);
                
                // Reschedule for retry if under limit
                if (notification.retry_count < 3) {
                    notification.status = 'pending';
                    notification.scheduled_delivery = new Date(now + Math.pow(2, notification.retry_count) * 60000).toISOString();
                }
            }
        });
        
        return {
            processed: deliveryResults.length,
            successful: deliveryResults.filter(r => r.status === 'fulfilled').length,
            failed: deliveryResults.filter(r => r.status === 'rejected').length,
            pending: this.notificationQueue.filter(n => n.status === 'pending').length
        };
    }

    /**
     * Deliver notification through specified channel
     */
    async deliverNotification(notification) {
        const channelConfig = this.notificationChannels[notification.channel];
        if (!channelConfig) {
            throw new Error(`Unsupported notification channel: ${notification.channel}`);
        }
        
        const deliveryStart = Date.now();
        
        try {
            // Format notification content for channel
            const formattedContent = await this.formatNotificationContent(notification, channelConfig);
            
            // Simulate delivery based on channel type
            await this.simulateChannelDelivery(notification.channel, formattedContent);
            
            const deliveryTime = Date.now() - deliveryStart;
            
            // Update performance metrics
            this.updateChannelPerformanceMetrics(notification.channel, {
                delivery_time: deliveryTime,
                success: true
            });
            
            // Record delivery in audit trail
            this.alertHistory.push({
                timestamp: new Date().toISOString(),
                type: 'notification_delivered',
                alert_id: notification.alert_id,
                notification_id: notification.id,
                channel: notification.channel,
                user_id: notification.user_id,
                delivery_time: deliveryTime,
                status: 'success'
            });
            
            return {
                notification_id: notification.id,
                status: 'delivered',
                channel: notification.channel,
                delivery_time: deliveryTime
            };
            
        } catch (error) {
            // Record delivery failure
            this.alertHistory.push({
                timestamp: new Date().toISOString(),
                type: 'notification_failed',
                alert_id: notification.alert_id,
                notification_id: notification.id,
                channel: notification.channel,
                user_id: notification.user_id,
                error: error.message,
                status: 'failed'
            });
            
            throw error;
        }
    }

    /**
     * Get comprehensive alert management dashboard
     */
    async getAlertDashboard(userProfile, timeframe = '30_days') {
        const userId = userProfile.user_id;
        const userSavedSearches = Array.from(this.savedSearches.values()).filter(s => s.user_id === userId);
        const userAlerts = Array.from(this.activeAlerts.values()).filter(a => a.user_id === userId);
        const userTracking = Array.from(this.opportunityTracking.values()).filter(t => t.user_id === userId);
        
        return {
            dashboard_summary: {
                saved_searches: {
                    total: userSavedSearches.length,
                    active: userSavedSearches.filter(s => s.status === 'active').length,
                    with_alerts: userSavedSearches.filter(s => s.alert_configuration.enabled).length
                },
                active_alerts: {
                    total: userAlerts.length,
                    successful_executions: userAlerts.reduce((sum, a) => sum + a.performance_tracking.successful_executions, 0),
                    opportunities_found: userAlerts.reduce((sum, a) => sum + a.performance_tracking.opportunities_found, 0),
                    next_execution: this.getNextAlertExecution(userAlerts)
                },
                opportunity_tracking: {
                    total_opportunities: userTracking.length,
                    actively_pursuing: userTracking.filter(t => t.pursuit_status === 'pursuing').length,
                    evaluation_stage: userTracking.filter(t => t.pursuit_status === 'evaluation').length,
                    won_opportunities: userTracking.filter(t => t.pursuit_status === 'won').length
                },
                notification_metrics: {
                    total_sent: this.calculateUserNotificationMetrics(userId, timeframe).total_sent,
                    delivery_rate: this.calculateUserNotificationMetrics(userId, timeframe).delivery_rate,
                    engagement_rate: this.calculateUserNotificationMetrics(userId, timeframe).engagement_rate
                }
            },
            recent_activity: {
                recent_opportunities: this.getRecentOpportunities(userId, 10),
                recent_alerts: this.getRecentAlertActivity(userId, 10),
                recent_tracking_updates: this.getRecentTrackingUpdates(userId, 10)
            },
            performance_analytics: {
                alert_effectiveness: this.calculateAlertEffectiveness(userAlerts, timeframe),
                search_performance: this.calculateSearchPerformance(userSavedSearches, timeframe),
                tracking_insights: this.calculateTrackingInsights(userTracking, timeframe)
            },
            recommendations: await this.generateDashboardRecommendations(userProfile, userSavedSearches, userAlerts, userTracking)
        };
    }

    /**
     * Get comprehensive analytics and reporting
     */
    async getAlertAnalytics(userProfile, timeframe = '30_days', includeComparative = false) {
        const analytics = {
            timeframe,
            generated_at: new Date().toISOString(),
            user_id: userProfile.user_id,
            
            alert_performance: {
                total_alerts: this.activeAlerts.size,
                active_alerts: Array.from(this.activeAlerts.values()).filter(a => a.status === 'active').length,
                total_executions: Array.from(this.activeAlerts.values()).reduce((sum, a) => sum + a.performance_tracking.total_executions, 0),
                success_rate: this.calculateOverallSuccessRate(),
                average_execution_time: this.calculateAverageExecutionTime(),
                opportunities_discovered: Array.from(this.activeAlerts.values()).reduce((sum, a) => sum + a.performance_tracking.opportunities_found, 0)
            },
            
            notification_analytics: {
                total_notifications: this.notificationQueue.length + this.alertHistory.filter(h => h.type === 'notification_delivered').length,
                delivery_metrics: this.calculateDeliveryMetrics(timeframe),
                channel_performance: this.calculateChannelPerformanceAnalytics(timeframe),
                engagement_metrics: this.calculateEngagementMetrics(timeframe)
            },
            
            opportunity_tracking_analytics: {
                total_tracked_opportunities: this.opportunityTracking.size,
                pursuit_rate: this.calculatePursuitRate(),
                win_rate: this.calculateWinRate(),
                average_opportunity_value: this.calculateAverageOpportunityValue(),
                top_performing_searches: this.identifyTopPerformingSearches(timeframe),
                market_distribution: this.calculateMarketDistribution()
            },
            
            business_impact: {
                total_opportunity_value_tracked: this.calculateTotalOpportunityValue(),
                estimated_time_saved: this.calculateTimeSavings(timeframe),
                opportunities_per_search: this.calculateOpportunitiesPerSearch(),
                alert_roi_estimate: this.calculateAlertROI(timeframe)
            },
            
            quality_metrics: {
                relevance_scores: this.calculateRelevanceScores(timeframe),
                false_positive_rate: this.calculateFalsePositiveRate(timeframe),
                user_satisfaction_indicators: this.calculateUserSatisfactionIndicators(timeframe),
                search_optimization_opportunities: this.identifyOptimizationOpportunities()
            }
        };
        
        if (includeComparative) {
            analytics.comparative_analysis = await this.generateComparativeAnalysis(userProfile, timeframe);
        }
        
        return analytics;
    }

    /**
     * Helper methods for ID generation
     */
    generateSavedSearchId() {
        return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    generateAlertId() {
        return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    generateExecutionId() {
        return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    generateNotificationId() {
        return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    generateTrackingId() {
        return `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Helper methods for business logic
     */
    calculateExecutionSchedule(frequency) {
        const schedules = {
            'immediate': null, // Event-driven
            'hourly': { interval: 'hour', value: 1 },
            'daily': { interval: 'day', value: 1 },
            'weekly': { interval: 'week', value: 1 },
            'monthly': { interval: 'month', value: 1 }
        };
        return schedules[frequency] || schedules['daily'];
    }

    calculateNextExecution(frequency) {
        const now = new Date();
        const nextExecution = new Date(now);
        
        switch (frequency) {
            case 'immediate':
                return now.toISOString();
            case 'hourly':
                nextExecution.setHours(now.getHours() + 1);
                break;
            case 'daily':
                nextExecution.setDate(now.getDate() + 1);
                break;
            case 'weekly':
                nextExecution.setDate(now.getDate() + 7);
                break;
            case 'monthly':
                nextExecution.setMonth(now.getMonth() + 1);
                break;
            default:
                nextExecution.setDate(now.getDate() + 1);
        }
        
        return nextExecution.toISOString();
    }

    compileBusinessRules(ruleNames) {
        const compiledRules = new Map();
        
        for (const ruleName of ruleNames || []) {
            const rule = this.defaultBusinessRules.get(ruleName);
            if (rule) {
                compiledRules.set(ruleName, rule);
            }
        }
        
        return compiledRules;
    }

    configureThrottling(throttlingLevel) {
        const throttlingConfigs = {
            'none': { max_per_hour: 1000, max_per_day: 24000 },
            'light': { max_per_hour: 100, max_per_day: 1000 },
            'standard': { max_per_hour: 10, max_per_day: 100 },
            'strict': { max_per_hour: 2, max_per_day: 20 }
        };
        return throttlingConfigs[throttlingLevel] || throttlingConfigs['standard'];
    }

    async scheduleAlertExecution(alert) {
        // In a real implementation, this would use a job scheduler
        // For now, we'll simulate scheduling
        return {
            alert_id: alert.id,
            scheduled: true,
            next_execution: alert.performance_tracking.next_execution
        };
    }

    async executeSearchForAlert(alert) {
        // Simulate search execution - would integrate with Search Orchestrator Agent
        const mockResults = Array.from({ length: 5 + Math.floor(Math.random() * 15) }, (_, i) => ({
            id: `opp_${Date.now()}_${i}`,
            title: `Sample Opportunity ${i + 1}`,
            agency: 'Sample Agency',
            value: Math.floor(Math.random() * 1000000) + 50000,
            closing_date: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
            naics_codes: ['541511', '541330'],
            source_platform: 'sam.gov',
            relevance_score: 60 + Math.random() * 40,
            strategic_score: 40 + Math.random() * 40
        }));
        
        return mockResults;
    }

    async applyBusinessRules(results, businessRules) {
        // Apply business rules to filter results
        let filteredResults = [...results];
        
        for (const [ruleName, rule] of businessRules.entries()) {
            filteredResults = this.applyBusinessRule(filteredResults, ruleName, rule);
        }
        
        return filteredResults;
    }

    applyBusinessRule(results, ruleName, rule) {
        switch (rule.type) {
            case 'threshold':
                if (ruleName === 'minimum_contract_value') {
                    return results.filter(r => r.value >= rule.default_value);
                } else if (ruleName === 'maximum_contract_value') {
                    return results.filter(r => r.value <= rule.default_value);
                }
                break;
            case 'temporal':
                if (ruleName === 'submission_timeline') {
                    const minDays = rule.default_value;
                    const minDate = new Date(Date.now() + minDays * 24 * 60 * 60 * 1000);
                    return results.filter(r => new Date(r.closing_date) >= minDate);
                }
                break;
            default:
                return results;
        }
        return results;
    }

    async identifyNewOpportunities(results, alert) {
        // Simple deduplication - would use more sophisticated logic in production
        const existingOpportunities = Array.from(this.opportunityTracking.values())
            .filter(t => t.source_alert_id === alert.id)
            .map(t => t.opportunity_id);
        
        return results.filter(r => !existingOpportunities.includes(r.id));
    }

    async prioritizeOpportunities(opportunities, alert) {
        return opportunities.map(opp => ({
            ...opp,
            priority_score: this.calculateOpportunityPriority(opp, alert)
        })).sort((a, b) => b.priority_score - a.priority_score);
    }

    calculateOpportunityPriority(opportunity, alert) {
        let priority = 50; // Base priority
        
        // Value-based scoring
        if (opportunity.value > 1000000) priority += 20;
        else if (opportunity.value > 500000) priority += 10;
        
        // Relevance-based scoring
        priority += (opportunity.relevance_score || 60) * 0.3;
        
        // Strategic value scoring
        priority += (opportunity.strategic_score || 50) * 0.2;
        
        // Time-based scoring
        const daysToClose = (new Date(opportunity.closing_date) - new Date()) / (1000 * 60 * 60 * 24);
        if (daysToClose < 7) priority += 15; // Urgent
        else if (daysToClose < 30) priority += 5;
        
        return Math.min(100, Math.max(0, priority));
    }

    async updateOpportunityTracking(opportunities, alert) {
        const trackingPromises = opportunities.map(async (opp) => {
            return await this.createOpportunityTracking(opp, alert, { user_id: alert.user_id });
        });
        
        return await Promise.all(trackingPromises);
    }

    calculateNotificationPriority(opportunity, alert) {
        const basePriority = alert.configuration.priority;
        const priorityScore = opportunity.priority_score || 50;
        
        if (priorityScore >= 80) return 'urgent';
        if (priorityScore >= 65) return 'high';
        if (priorityScore >= 40) return 'medium';
        return 'low';
    }

    selectNotificationChannels(priority, configuredChannels) {
        const priorityChannels = this.priorityRules.urgency_scoring[priority]?.channels || ['email'];
        return configuredChannels.filter(channel => priorityChannels.includes(channel));
    }

    selectNotificationTemplate(opportunity, channel) {
        return this.notificationChannels[channel]?.templates?.new_opportunity || 'default_template';
    }

    calculateDeliveryTime(priority) {
        const delays = {
            'immediate': 0,
            'urgent': 30000, // 30 seconds
            'high': 300000, // 5 minutes
            'medium': 900000, // 15 minutes
            'low': 3600000 // 1 hour
        };
        
        return new Date(Date.now() + (delays[priority] || delays['medium'])).toISOString();
    }

    async createNotification(notificationData) {
        return {
            ...notificationData,
            created_at: new Date().toISOString(),
            retry_count: 0
        };
    }

    getPriorityScore(priority) {
        return this.priorityRules.urgency_scoring[priority]?.score || 40;
    }

    async checkRateLimits(channel, userId) {
        // Simplified rate limiting - would use Redis or similar in production
        const limits = this.notificationChannels[channel]?.rate_limits;
        if (!limits) return true;
        
        // For now, always allow (would implement proper rate limiting)
        return true;
    }

    async simulateChannelDelivery(channel, content) {
        // Simulate delivery time based on channel
        const deliveryTimes = {
            'email': 100 + Math.random() * 500,
            'sms': 50 + Math.random() * 200,
            'webhook': 20 + Math.random() * 100,
            'in_app': 10 + Math.random() * 50
        };
        
        await new Promise(resolve => setTimeout(resolve, deliveryTimes[channel] || 100));
        return { status: 'delivered', timestamp: new Date().toISOString() };
    }

    async formatNotificationContent(notification, channelConfig) {
        // Format content based on channel capabilities
        const opportunity = notification.opportunity;
        
        const baseContent = {
            subject: `New Opportunity: ${opportunity.title}`,
            body: `A new opportunity matching your search criteria has been found:\n\n` +
                  `Title: ${opportunity.title}\n` +
                  `Agency: ${opportunity.agency}\n` +
                  `Value: $${opportunity.value.toLocaleString()}\n` +
                  `Closing Date: ${new Date(opportunity.closing_date).toLocaleDateString()}\n` +
                  `Relevance Score: ${opportunity.relevance_score?.toFixed(1) || 'N/A'}`
        };
        
        if (channelConfig.rich_content) {
            return {
                ...baseContent,
                html_body: this.generateHTMLContent(opportunity),
                attachments: channelConfig.attachment_support ? this.generateAttachments(opportunity) : null
            };
        }
        
        return baseContent;
    }

    generateHTMLContent(opportunity) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <h2 style="color: #2c5aa0;">New Opportunity Alert</h2>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
                    <h3>${opportunity.title}</h3>
                    <p><strong>Agency:</strong> ${opportunity.agency}</p>
                    <p><strong>Value:</strong> $${opportunity.value.toLocaleString()}</p>
                    <p><strong>Closing Date:</strong> ${new Date(opportunity.closing_date).toLocaleDateString()}</p>
                    <p><strong>Relevance Score:</strong> ${opportunity.relevance_score?.toFixed(1) || 'N/A'}</p>
                </div>
            </div>
        `;
    }

    generateAttachments(opportunity) {
        return [
            {
                name: 'opportunity_details.pdf',
                type: 'application/pdf',
                content: 'base64_encoded_pdf_content'
            }
        ];
    }

    updateDeliveryMetrics(result, channel) {
        const metrics = this.performanceMetrics.get('delivery_metrics') || {
            total_sent: 0,
            successful: 0,
            failed: 0,
            by_channel: new Map()
        };
        
        metrics.total_sent++;
        if (result === 'success') {
            metrics.successful++;
        } else {
            metrics.failed++;
        }
        
        const channelMetrics = metrics.by_channel.get(channel) || { sent: 0, successful: 0, failed: 0 };
        channelMetrics.sent++;
        if (result === 'success') {
            channelMetrics.successful++;
        } else {
            channelMetrics.failed++;
        }
        metrics.by_channel.set(channel, channelMetrics);
        
        this.performanceMetrics.set('delivery_metrics', metrics);
    }

    updateChannelPerformanceMetrics(channel, metrics) {
        const channelPerf = this.performanceMetrics.get('channel_performance') || new Map();
        const existing = channelPerf.get(channel) || {
            total_deliveries: 0,
            successful_deliveries: 0,
            average_delivery_time: 0,
            total_delivery_time: 0
        };
        
        existing.total_deliveries++;
        if (metrics.success) {
            existing.successful_deliveries++;
            existing.total_delivery_time += metrics.delivery_time;
            existing.average_delivery_time = existing.total_delivery_time / existing.successful_deliveries;
        }
        
        channelPerf.set(channel, existing);
        this.performanceMetrics.set('channel_performance', channelPerf);
    }

    updateAverageExecutionTime(currentAverage, executionCount, newTime) {
        return ((currentAverage * (executionCount - 1)) + newTime) / executionCount;
    }

    generateResultsSummary(opportunities) {
        if (opportunities.length === 0) {
            return {
                total: 0,
                high_priority: 0,
                total_value: 0,
                average_priority_score: 0
            };
        }
        
        return {
            total: opportunities.length,
            high_priority: opportunities.filter(o => o.priority_score >= 70).length,
            total_value: opportunities.reduce((sum, o) => sum + o.value, 0),
            average_priority_score: opportunities.reduce((sum, o) => sum + (o.priority_score || 50), 0) / opportunities.length,
            top_agencies: [...new Set(opportunities.map(o => o.agency))].slice(0, 3)
        };
    }

    calculateInitialPursuitProbability(opportunity, userProfile) {
        // Simple initial calculation - would be more sophisticated in production
        let probability = 30; // Base 30%
        
        if (opportunity.relevance_score > 80) probability += 20;
        else if (opportunity.relevance_score > 60) probability += 10;
        
        if (opportunity.value >= 100000 && opportunity.value <= 2000000) probability += 15;
        
        const daysToClose = (new Date(opportunity.closing_date) - new Date()) / (1000 * 60 * 60 * 24);
        if (daysToClose >= 21) probability += 10;
        
        return Math.min(80, Math.max(10, probability));
    }

    calculateNextMilestone(opportunity) {
        const daysToClose = (new Date(opportunity.closing_date) - new Date()) / (1000 * 60 * 60 * 24);
        
        if (daysToClose > 14) {
            return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 1 week follow-up
        } else {
            return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 day follow-up
        }
    }

    generateOpportunityTrackingSummary(tracking) {
        return {
            opportunity_title: tracking.opportunity_details.title,
            agency: tracking.opportunity_details.agency,
            value: tracking.opportunity_details.value,
            closing_date: tracking.opportunity_details.closing_date,
            current_status: tracking.pursuit_status,
            pursuit_probability: tracking.pursuit_probability,
            next_milestone: tracking.key_dates.next_milestone,
            days_to_close: Math.ceil((new Date(tracking.opportunity_details.closing_date) - new Date()) / (1000 * 60 * 60 * 24))
        };
    }

    generateConfigurationSummary(savedSearch) {
        return {
            search_criteria: {
                keywords: savedSearch.search_criteria.keywords.length,
                naics_codes: savedSearch.search_criteria.naics_codes.length,
                geographic_scope: savedSearch.search_criteria.geographic_scope,
                market_segments: savedSearch.search_criteria.market_segments
            },
            alert_configuration: {
                frequency: savedSearch.alert_configuration.frequency,
                channels: savedSearch.alert_configuration.channels.length,
                priority: savedSearch.alert_configuration.priority
            },
            tracking_enabled: savedSearch.tracking_configuration.track_opportunities
        };
    }

    // Placeholder methods for dashboard and analytics
    getNextAlertExecution(alerts) {
        const nextExecutions = alerts
            .filter(a => a.performance_tracking.next_execution)
            .map(a => new Date(a.performance_tracking.next_execution))
            .sort((a, b) => a - b);
        
        return nextExecutions[0]?.toISOString() || null;
    }

    calculateUserNotificationMetrics(userId, timeframe) {
        // Simplified calculation - would be more comprehensive in production
        return {
            total_sent: 45,
            delivery_rate: 0.98,
            engagement_rate: 0.35
        };
    }

    getRecentOpportunities(userId, limit) {
        return Array.from(this.opportunityTracking.values())
            .filter(t => t.user_id === userId)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, limit)
            .map(t => this.generateOpportunityTrackingSummary(t));
    }

    getRecentAlertActivity(userId, limit) {
        return this.alertHistory
            .filter(h => h.user_id === userId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }

    getRecentTrackingUpdates(userId, limit) {
        return Array.from(this.opportunityTracking.values())
            .filter(t => t.user_id === userId && t.status_history.length > 1)
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, limit)
            .map(t => ({
                tracking_id: t.id,
                opportunity_title: t.opportunity_details.title,
                current_status: t.pursuit_status,
                last_update: t.updated_at,
                latest_activity: t.status_history[t.status_history.length - 1]
            }));
    }

    calculateAlertEffectiveness(alerts, timeframe) {
        const totalAlerts = alerts.length;
        const activeAlerts = alerts.filter(a => a.status === 'active').length;
        const totalOpportunities = alerts.reduce((sum, a) => sum + a.performance_tracking.opportunities_found, 0);
        const avgOpportunitiesPerAlert = totalAlerts > 0 ? totalOpportunities / totalAlerts : 0;
        
        return {
            total_alerts: totalAlerts,
            active_alerts: activeAlerts,
            total_opportunities_found: totalOpportunities,
            average_opportunities_per_alert: avgOpportunitiesPerAlert,
            alert_utilization_rate: totalAlerts > 0 ? activeAlerts / totalAlerts : 0
        };
    }

    calculateSearchPerformance(savedSearches, timeframe) {
        return {
            total_searches: savedSearches.length,
            with_alerts: savedSearches.filter(s => s.alert_configuration.enabled).length,
            average_execution_frequency: 'daily',
            most_productive_searches: savedSearches
                .sort((a, b) => b.performance_metrics.opportunities_found - a.performance_metrics.opportunities_found)
                .slice(0, 3)
                .map(s => ({ name: s.name, opportunities: s.performance_metrics.opportunities_found }))
        };
    }

    calculateTrackingInsights(tracking, timeframe) {
        const totalTracked = tracking.length;
        const byStatus = tracking.reduce((acc, t) => {
            acc[t.pursuit_status] = (acc[t.pursuit_status] || 0) + 1;
            return acc;
        }, {});
        
        return {
            total_opportunities_tracked: totalTracked,
            status_distribution: byStatus,
            average_pursuit_probability: totalTracked > 0 ? 
                tracking.reduce((sum, t) => sum + t.pursuit_probability, 0) / totalTracked : 0,
            total_opportunity_value: tracking.reduce((sum, t) => sum + t.opportunity_details.value, 0)
        };
    }

    async generateDashboardRecommendations(userProfile, savedSearches, alerts, tracking) {
        const recommendations = [];
        
        // Search optimization recommendations
        if (savedSearches.length < 3) {
            recommendations.push({
                type: 'search_optimization',
                priority: 'medium',
                title: 'Create Additional Saved Searches',
                description: 'Consider creating more targeted saved searches to improve opportunity coverage',
                action: 'create_saved_search'
            });
        }
        
        // Alert performance recommendations
        const lowPerformingAlerts = alerts.filter(a => a.performance_tracking.opportunities_found === 0);
        if (lowPerformingAlerts.length > 0) {
            recommendations.push({
                type: 'alert_optimization',
                priority: 'high',
                title: 'Optimize Underperforming Alerts',
                description: `${lowPerformingAlerts.length} alerts haven't found any opportunities. Consider adjusting search criteria.`,
                action: 'review_alert_criteria'
            });
        }
        
        // Tracking utilization recommendations
        const untrackedOpportunities = tracking.filter(t => t.pursuit_status === 'evaluation').length;
        if (untrackedOpportunities > 5) {
            recommendations.push({
                type: 'tracking_utilization',
                priority: 'medium',
                title: 'Update Opportunity Status',
                description: `${untrackedOpportunities} opportunities are still in evaluation. Update their pursuit status.`,
                action: 'update_opportunity_status'
            });
        }
        
        return recommendations;
    }

    // Additional analytics calculation methods (simplified for demonstration)
    calculateOverallSuccessRate() {
        const alerts = Array.from(this.activeAlerts.values());
        const totalExecutions = alerts.reduce((sum, a) => sum + a.performance_tracking.total_executions, 0);
        const successfulExecutions = alerts.reduce((sum, a) => sum + a.performance_tracking.successful_executions, 0);
        return totalExecutions > 0 ? successfulExecutions / totalExecutions : 0;
    }

    calculateAverageExecutionTime() {
        const alerts = Array.from(this.activeAlerts.values());
        const validExecutionTimes = alerts
            .filter(a => a.performance_tracking.average_execution_time > 0)
            .map(a => a.performance_tracking.average_execution_time);
        
        return validExecutionTimes.length > 0 ? 
            validExecutionTimes.reduce((sum, time) => sum + time, 0) / validExecutionTimes.length : 0;
    }

    calculateDeliveryMetrics(timeframe) {
        const metrics = this.performanceMetrics.get('delivery_metrics') || { total_sent: 0, successful: 0, failed: 0 };
        return {
            total_sent: metrics.total_sent,
            delivery_rate: metrics.total_sent > 0 ? metrics.successful / metrics.total_sent : 0,
            failure_rate: metrics.total_sent > 0 ? metrics.failed / metrics.total_sent : 0
        };
    }

    calculateChannelPerformanceAnalytics(timeframe) {
        const channelPerf = this.performanceMetrics.get('channel_performance') || new Map();
        const analytics = {};
        
        for (const [channel, metrics] of channelPerf.entries()) {
            analytics[channel] = {
                total_deliveries: metrics.total_deliveries,
                success_rate: metrics.total_deliveries > 0 ? metrics.successful_deliveries / metrics.total_deliveries : 0,
                average_delivery_time: metrics.average_delivery_time
            };
        }
        
        return analytics;
    }

    calculateEngagementMetrics(timeframe) {
        const engagement = this.performanceMetrics.get('engagement_metrics') || {
            alerts_opened: 0, alerts_clicked: 0, alerts_acted_upon: 0
        };
        
        return {
            open_rate: engagement.alerts_opened / Math.max(1, engagement.total_sent || 1),
            click_through_rate: engagement.alerts_clicked / Math.max(1, engagement.alerts_opened || 1),
            action_rate: engagement.alerts_acted_upon / Math.max(1, engagement.alerts_clicked || 1)
        };
    }

    calculatePursuitRate() {
        const tracking = Array.from(this.opportunityTracking.values());
        const pursuing = tracking.filter(t => ['pursuing', 'won'].includes(t.pursuit_status));
        return tracking.length > 0 ? pursuing.length / tracking.length : 0;
    }

    calculateWinRate() {
        const tracking = Array.from(this.opportunityTracking.values());
        const pursued = tracking.filter(t => ['pursuing', 'won', 'lost'].includes(t.pursuit_status));
        const won = tracking.filter(t => t.pursuit_status === 'won');
        return pursued.length > 0 ? won.length / pursued.length : 0;
    }

    calculateAverageOpportunityValue() {
        const tracking = Array.from(this.opportunityTracking.values());
        return tracking.length > 0 ? 
            tracking.reduce((sum, t) => sum + t.opportunity_details.value, 0) / tracking.length : 0;
    }

    identifyTopPerformingSearches(timeframe) {
        const searches = Array.from(this.savedSearches.values());
        return searches
            .sort((a, b) => b.performance_metrics.opportunities_found - a.performance_metrics.opportunities_found)
            .slice(0, 5)
            .map(s => ({
                name: s.name,
                opportunities_found: s.performance_metrics.opportunities_found,
                success_rate: s.performance_metrics.success_rate
            }));
    }

    calculateMarketDistribution() {
        const tracking = Array.from(this.opportunityTracking.values());
        const distribution = tracking.reduce((acc, t) => {
            const platform = t.opportunity_details.source_platform;
            acc[platform] = (acc[platform] || 0) + 1;
            return acc;
        }, {});
        
        return distribution;
    }

    calculateTotalOpportunityValue() {
        const tracking = Array.from(this.opportunityTracking.values());
        return tracking.reduce((sum, t) => sum + t.opportunity_details.value, 0);
    }

    calculateTimeSavings(timeframe) {
        // Estimate time saved through automation
        const totalAlerts = Array.from(this.activeAlerts.values()).length;
        const totalExecutions = this.activeAlerts.size * 30; // Assuming monthly average
        const timePerManualSearch = 2; // hours
        return totalExecutions * timePerManualSearch;
    }

    calculateOpportunitiesPerSearch() {
        const searches = Array.from(this.savedSearches.values());
        const totalOpportunities = searches.reduce((sum, s) => sum + s.performance_metrics.opportunities_found, 0);
        const totalSearches = searches.reduce((sum, s) => sum + s.performance_metrics.total_searches, 0);
        return totalSearches > 0 ? totalOpportunities / totalSearches : 0;
    }

    calculateAlertROI(timeframe) {
        const totalValue = this.calculateTotalOpportunityValue();
        const timeSaved = this.calculateTimeSavings(timeframe);
        const costOfTime = timeSaved * 100; // $100/hour assumption
        const systemCost = 5000; // Monthly system cost assumption
        
        return {
            total_opportunity_value: totalValue,
            time_savings_value: costOfTime,
            system_cost: systemCost,
            estimated_roi: ((totalValue * 0.1 + costOfTime) - systemCost) / systemCost // Assuming 10% conversion rate
        };
    }

    // Additional placeholder methods for comprehensive analytics
    calculateRelevanceScores(timeframe) {
        return { average: 72, median: 75, distribution: { high: 0.4, medium: 0.45, low: 0.15 } };
    }

    calculateFalsePositiveRate(timeframe) {
        return 0.12; // 12% false positive rate
    }

    calculateUserSatisfactionIndicators(timeframe) {
        return { satisfaction_score: 4.2, response_rate: 0.68, improvement_suggestions: 15 };
    }

    identifyOptimizationOpportunities() {
        return [
            'Refine keyword combinations for better precision',
            'Adjust value thresholds based on pursuit patterns',
            'Optimize alert frequency based on market activity'
        ];
    }

    async generateComparativeAnalysis(userProfile, timeframe) {
        return {
            industry_benchmark: {
                average_opportunities_per_search: 12,
                average_pursuit_rate: 0.25,
                average_win_rate: 0.18
            },
            user_performance: {
                opportunities_per_search: this.calculateOpportunitiesPerSearch(),
                pursuit_rate: this.calculatePursuitRate(),
                win_rate: this.calculateWinRate()
            },
            performance_ranking: 'Above Average' // Simplified
        };
    }

    /**
     * Public API methods
     */
    async quickCreateAlert(searchQuery, userProfile, options = {}) {
        const searchConfig = {
            name: `Quick Alert: ${searchQuery}`,
            description: `Automated alert for: ${searchQuery}`,
            keywords: searchQuery.split(' ').filter(w => w.length > 3),
            alert_frequency: options.frequency || 'daily',
            notification_channels: options.channels || ['email', 'in_app'],
            ...options
        };
        
        return await this.createSavedSearch(searchConfig, userProfile);
    }

    async bulkCreateAlerts(alertConfigs, userProfile) {
        const results = [];
        
        for (const config of alertConfigs) {
            try {
                const result = await this.createSavedSearch(config, userProfile);
                results.push({ status: 'success', ...result });
            } catch (error) {
                results.push({ status: 'error', error: error.message, config: config.name });
            }
        }
        
        return {
            total_processed: alertConfigs.length,
            successful: results.filter(r => r.status === 'success').length,
            failed: results.filter(r => r.status === 'error').length,
            results: results
        };
    }

    async pauseAlert(alertId, userProfile) {
        const alert = this.activeAlerts.get(alertId);
        if (!alert || alert.user_id !== userProfile.user_id) {
            throw new Error('Alert not found or access denied');
        }
        
        alert.status = 'paused';
        alert.updated_at = new Date().toISOString();
        
        return { alert_id: alertId, status: 'paused', paused_at: alert.updated_at };
    }

    async resumeAlert(alertId, userProfile) {
        const alert = this.activeAlerts.get(alertId);
        if (!alert || alert.user_id !== userProfile.user_id) {
            throw new Error('Alert not found or access denied');
        }
        
        alert.status = 'active';
        alert.updated_at = new Date().toISOString();
        alert.performance_tracking.next_execution = this.calculateNextExecution(alert.configuration.frequency);
        
        return { 
            alert_id: alertId, 
            status: 'active', 
            resumed_at: alert.updated_at,
            next_execution: alert.performance_tracking.next_execution 
        };
    }

    async deleteAlert(alertId, userProfile) {
        const alert = this.activeAlerts.get(alertId);
        if (!alert || alert.user_id !== userProfile.user_id) {
            throw new Error('Alert not found or access denied');
        }
        
        this.activeAlerts.delete(alertId);
        
        // Also update associated saved search
        const savedSearch = Array.from(this.savedSearches.values()).find(s => s.id === alert.saved_search_id);
        if (savedSearch) {
            savedSearch.alert_configuration.enabled = false;
            savedSearch.updated_at = new Date().toISOString();
        }
        
        return { alert_id: alertId, status: 'deleted', deleted_at: new Date().toISOString() };
    }
}

module.exports = AlertManagerAgent;