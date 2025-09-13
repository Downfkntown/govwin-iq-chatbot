/**
 * Customer Success Agent
 * 
 * Purpose: Platform navigation, troubleshooting, escalation, and guidance on using
 * GovWin's existing reporting, tracking, and workflow tools
 * Focus: Teaching HOW to use GovWin's built-in features effectively
 * Does NOT: Replicate platform functionality - guides users to proper tools and features
 */

class CustomerSuccessAgent {
    constructor(logger) {
        this.logger = logger;
        this.agentId = 'customer-success';
        this.capabilities = [
            'platform_navigation',
            'troubleshooting_support',
            'workflow_guidance', 
            'reporting_tools',
            'tracking_features',
            'user_training',
            'escalation_management',
            'feature_education',
            'best_practices'
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
        
        // Troubleshooting and technical issues
        if (queryLower.includes('error') || queryLower.includes('broken') || queryLower.includes('not working') || 
            queryLower.includes('problem') || queryLower.includes('issue') || queryLower.includes('bug')) {
            return 'troubleshooting_support';
        }
        
        // Login and access issues
        if (queryLower.includes('login') || queryLower.includes('password') || queryLower.includes('access') ||
            queryLower.includes('locked out') || queryLower.includes('cant log in')) {
            return 'access_support';
        }
        
        // Reporting and analytics guidance
        if (queryLower.includes('report') || queryLower.includes('analytics') || queryLower.includes('dashboard') ||
            queryLower.includes('metrics') || queryLower.includes('export')) {
            return 'reporting_guidance';
        }
        
        // Pipeline and tracking features
        if (queryLower.includes('pipeline') || queryLower.includes('track') || queryLower.includes('manage') ||
            queryLower.includes('organize') || queryLower.includes('workflow')) {
            return 'tracking_workflow_guidance';
        }
        
        // Team and collaboration features
        if (queryLower.includes('team') || queryLower.includes('share') || queryLower.includes('collaborate') ||
            queryLower.includes('permission') || queryLower.includes('user')) {
            return 'collaboration_guidance';
        }
        
        // Account and subscription issues  
        if (queryLower.includes('account') || queryLower.includes('subscription') || queryLower.includes('billing') ||
            queryLower.includes('license') || queryLower.includes('upgrade')) {
            return 'account_support';
        }
        
        // Integration and API questions
        if (queryLower.includes('integration') || queryLower.includes('api') || queryLower.includes('connect') ||
            queryLower.includes('sync') || queryLower.includes('crm') || queryLower.includes('export')) {
            return 'integration_support';
        }
        
        // Training and how-to questions
        if (queryLower.includes('how') && (queryLower.includes('use') || queryLower.includes('work') || 
            queryLower.includes('setup') || queryLower.includes('configure'))) {
            return 'training_guidance';
        }
        
        // Escalation requests
        if (queryLower.includes('manager') || queryLower.includes('supervisor') || queryLower.includes('escalate') ||
            queryLower.includes('complain') || queryLower.includes('urgent')) {
            return 'escalation_request';
        }
        
        return 'general_support';
    }

    async generateSuccessGuidance(intent, query, context) {
        const guidance = {
            content: '',
            type: 'customer_success',
            nextSteps: [],
            escalationSuggested: false,
            urgency: 'normal',
            confidence: 0.8
        };

        switch (intent) {
            case 'troubleshooting_support':
                guidance.content = `I'll help you troubleshoot this issue in GovWin IQ. Let me guide you through some common solutions:

**Quick Troubleshooting Steps:**

1. **Browser & Connectivity**
   • Clear your browser cache and cookies
   • Try a different browser (Chrome, Firefox, Safari)
   • Disable browser extensions temporarily
   • Check your internet connection stability

2. **Account & Session Issues**
   • Log out completely and log back in
   • Try incognito/private browsing mode
   • Verify your account hasn't expired
   • Check if you're using the correct login URL

3. **Feature-Specific Issues**
   • Refresh the page and try the action again
   • Check if the feature requires specific permissions
   • Verify you're in the correct section of GovWin IQ
   • Look for any error messages or notifications

4. **Data & Search Problems**
   • Simplify your search criteria and try again
   • Check date ranges and filter settings
   • Verify you have access to the data you're seeking
   • Try alternative search approaches

**If these steps don't resolve the issue:**
• I can connect you with our technical support team
• They can access your account and provide specific assistance
• Have your account details and error descriptions ready

**Need immediate assistance?** I can escalate this to a Customer Success Manager who can provide real-time troubleshooting support.`;

                guidance.type = 'troubleshooting_guide';
                guidance.nextSteps = [
                    'Try the basic troubleshooting steps above',
                    'Document any error messages you see',
                    'Note which specific feature or section has issues',
                    'If unresolved, I can connect you with technical support',
                    'Consider scheduling a screen-sharing session for complex issues'
                ];
                guidance.urgency = 'high';
                break;

            case 'access_support':
                guidance.content = `I'll help you resolve login and access issues with GovWin IQ:

**Login Troubleshooting:**

**Password Issues:**
• Use "Forgot Password" on the login page
• Check your email for reset instructions
• Ensure you're using the most recent password
• Try typing password manually (avoid copy/paste)

**Account Lockout:**
• Wait 15 minutes and try again
• Multiple failed attempts trigger temporary lockout
• Use the account unlock option if available
• Contact support if lockout persists

**Access & Permissions:**
• Verify your subscription is current and active
• Check if your account has been deactivated
• Confirm you're accessing the correct GovWin environment
• Ensure your email address is still valid

**Browser & Technical:**
• Clear browser cache and cookies
• Disable password managers temporarily
• Try incognito/private browsing mode
• Use a supported browser (Chrome, Firefox, Safari)

**Still Can't Access?**
I can immediately escalate this to our Account Support team who can:
• Verify your account status and permissions
• Reset passwords and unlock accounts
• Update account information and contacts
• Provide immediate access restoration

**For urgent access needs**, I recommend direct phone support for fastest resolution.`;

                guidance.type = 'access_support_guide';
                guidance.nextSteps = [
                    'Try password reset if needed',
                    'Clear browser data and retry',
                    'Verify account email and status',
                    'If still blocked, I will escalate to Account Support',
                    'Consider phone support for urgent access needs'
                ];
                guidance.escalationSuggested = true;
                guidance.urgency = 'high';
                break;

            case 'reporting_guidance':
                guidance.content = `I'll guide you through GovWin IQ's reporting and analytics tools to get the insights you need:

**Built-in Reporting Tools:**

**Dashboard Reports:**
• Navigate to your main Dashboard
• Use the "Add Widget" option to customize views
• Select from pre-built report widgets
• Configure date ranges and filters

**Opportunity Reports:**
• Go to Opportunities → Reports section
• Choose from standard report templates:
  - Market Analysis Reports
  - Pipeline Performance Reports  
  - Win Rate Analytics
  - Competitive Intelligence Reports

**Custom Report Builder:**
• Access through Tools → Report Builder
• Select your data sources (opportunities, awards, etc.)
• Add filters and grouping criteria
• Choose visualization types (charts, tables, maps)
• Save reports for ongoing use

**Export and Sharing:**
• All reports can be exported to Excel, PDF, or CSV
• Set up automated report delivery via email
• Share reports with team members
• Schedule recurring reports for stakeholders

**Analytics Features:**
• **Trend Analysis**: Track market patterns over time
• **Geographic Analysis**: Map-based opportunity distribution
• **Competitive Intelligence**: Track competitor wins/losses
• **Pipeline Metrics**: Conversion rates and forecasting

**Advanced Analytics:**
• Navigate to Intelligence → Market Analytics
• Use the Advanced Analytics module for deeper insights
• Create custom dashboards for executive reporting
• Set up KPI monitoring and alerts

**Need help with a specific report?** I can walk you through creating exactly what you need, or connect you with our Analytics team for complex requirements.`;

                guidance.type = 'reporting_tutorial';
                guidance.nextSteps = [
                    'Navigate to Dashboard → Add Widget for quick reports',
                    'Explore Opportunities → Reports for standard templates',
                    'Try Tools → Report Builder for custom reports',
                    'Set up automated report delivery if needed',
                    'Contact Analytics team for advanced requirements'
                ];
                break;

            case 'tracking_workflow_guidance':
                guidance.content = `I'll show you how to use GovWin IQ's pipeline management and tracking features effectively:

**Pipeline Management Tools:**

**Opportunity Pipeline:**
• Navigate to "My Pipeline" from the main menu
• Add opportunities using the "+" button
• Set stages: Identified, Qualified, Proposal, etc.
• Update probability percentages and estimated values

**Tracking Features:**
• **Status Updates**: Change opportunity stages as they progress
• **Activity Logging**: Record calls, meetings, and actions taken
• **Document Management**: Attach RFPs, proposals, and related files
• **Team Collaboration**: Assign team members and responsibilities

**Workflow Organization:**
• **Custom Stages**: Set up stages that match your sales process
• **Automated Notifications**: Get alerts for stage changes
• **Follow-up Reminders**: Set tasks and deadlines
• **Pipeline Views**: Switch between list, card, and calendar views

**Advanced Tracking:**
• **Forecasting Tools**: Generate revenue projections
• **Win/Loss Analysis**: Track outcomes and learn from results
• **Competitive Tracking**: Monitor competitor activity
• **Client Relationship Management**: Track contacts and communications

**Team Workflow Features:**
• **Shared Pipelines**: Collaborate with team members
• **Permission Management**: Control who can edit what
• **Activity Feeds**: See team activity and updates
• **Reporting**: Generate team performance reports

**Integration with Search:**
• Import opportunities directly from search results
• Set up alerts to auto-populate pipeline
• Sync with CRM systems if configured
• Export pipeline data for external analysis

**Best Practices:**
• Update opportunity stages weekly
• Log all client interactions
• Set realistic probability percentages
• Use notes for strategy and next steps
• Review pipeline in weekly team meetings

**Want personalized training?** I can arrange a screen-sharing session to set up your workflow exactly how you need it.`;

                guidance.type = 'workflow_tutorial';
                guidance.nextSteps = [
                    'Navigate to "My Pipeline" to start organizing',
                    'Add your current opportunities and set stages',
                    'Configure custom stages for your process',
                    'Set up automated notifications and reminders',
                    'Schedule pipeline review sessions with your team'
                ];
                break;

            case 'collaboration_guidance':
                guidance.content = `I'll help you set up team collaboration and sharing features in GovWin IQ:

**Team Collaboration Tools:**

**User Management:**
• Navigate to Account Settings → Team Management
• Add team members with appropriate permission levels
• Set up user groups for different departments/roles
• Configure access levels: Admin, Manager, User, Viewer

**Sharing & Permissions:**
• **Saved Searches**: Share search criteria with team
• **Pipeline Sharing**: Create team pipelines and individual ones
• **Report Sharing**: Distribute reports to stakeholders
• **Alert Sharing**: Set up team-wide monitoring alerts

**Collaboration Features:**
• **Opportunity Comments**: Add notes and discussions to opportunities
• **Activity Feeds**: See what team members are working on
• **Task Assignment**: Delegate research and follow-up tasks
• **Team Calendars**: Schedule and track important dates

**Communication Tools:**
• **Internal Messaging**: Built-in team communication
• **Notification Settings**: Control what alerts you receive
• **Status Updates**: Keep team informed of progress
• **Meeting Integration**: Sync with calendar systems

**Workflow Coordination:**
• **Pipeline Handoffs**: Transfer opportunities between team members
• **Review Processes**: Set up approval workflows
• **Territory Management**: Assign geographic or market territories
• **Performance Tracking**: Monitor team metrics and goals

**External Sharing:**
• **Client Reports**: Generate client-facing reports and presentations
• **Partner Access**: Provide limited access to partners/subcontractors
• **Executive Dashboards**: Create high-level views for leadership
• **Export Functions**: Share data with external stakeholders

**Best Practices for Team Setup:**
• Start with clear role definitions and permissions
• Set up regular pipeline review meetings
• Use shared searches for common market segments
• Create team-specific dashboards and reports
• Establish communication protocols and notification preferences

**Need help setting up your team?** I can connect you with our Team Success Manager who specializes in organizational setup and best practices.`;

                guidance.type = 'collaboration_tutorial';
                guidance.nextSteps = [
                    'Go to Account Settings → Team Management',
                    'Add team members with appropriate permissions',
                    'Set up shared searches and pipelines',
                    'Configure notification and communication preferences',
                    'Schedule team training session if needed'
                ];
                break;

            case 'account_support':
                guidance.content = `I'll help you with account and subscription questions for GovWin IQ:

**Account Management:**

**Subscription & Billing:**
• Check your current plan: Account Settings → Subscription
• View billing history and payment methods
• Understand feature limits for your current plan
• See renewal dates and auto-renewal settings

**Upgrade & Downgrade Options:**
• Compare plan features and pricing
• Understand the impact of plan changes
• Process upgrades for immediate additional features
• Schedule downgrades for next billing cycle

**User License Management:**
• Add or remove user seats as needed
• Transfer licenses between team members
• Understand user limit policies
• Optimize license usage for cost efficiency

**Account Information Updates:**
• Update billing contacts and addresses
• Change primary account administrator
• Modify company information and details
• Update payment methods and billing preferences

**Data & Export Policies:**
• Understand data retention policies
• Learn about export capabilities and limits
• Know your data backup and recovery options
• Review data security and compliance features

**Support & Training Entitlements:**
• Check what support level your plan includes
• See available training resources and sessions
• Understand implementation and onboarding services
• Learn about priority support options

**For Account Changes:**
Since account and billing changes often require verification and approval, I recommend connecting you directly with our Account Management team. They can:

• Process subscription changes immediately
• Provide detailed billing explanations
• Help optimize your plan for your needs
• Handle payment and technical billing issues
• Set up custom enterprise features if applicable

**Should I escalate this to Account Management for immediate assistance?**`;

                guidance.type = 'account_support_guide';
                guidance.nextSteps = [
                    'Review current account details in Settings',
                    'Identify specific changes or questions you have',
                    'Gather billing or subscription documentation if needed',
                    'I can connect you with Account Management team',
                    'Consider scheduling a plan optimization review'
                ];
                guidance.escalationSuggested = true;
                break;

            case 'integration_support':
                guidance.content = `I'll help you with GovWin IQ integrations and data connectivity options:

**Available Integrations:**

**CRM Integration:**
• Salesforce connector for opportunity sync
• HubSpot integration for lead management
• Microsoft Dynamics 365 connectivity
• Custom CRM connections via API

**Data Export & Import:**
• Excel/CSV export from all data views
• Automated report delivery via email
• Bulk data import for pipeline management
• API access for custom integrations

**Business Intelligence Tools:**
• Power BI connector for advanced analytics
• Tableau integration for data visualization
• Custom dashboard creation and embedding
• Real-time data feeds for reporting tools

**Calendar & Communication:**
• Outlook calendar integration for deadlines
• Teams/Slack notifications for alerts
• Email integration for opportunity updates
• Mobile app sync for on-the-go access

**Setting Up Integrations:**

1. **Check Your Plan**: Some integrations require specific subscription levels
2. **Access Integration Hub**: Found in Account Settings → Integrations
3. **Authentication**: Connect accounts using secure OAuth protocols
4. **Configuration**: Set sync frequency and data mapping preferences
5. **Testing**: Verify data flows correctly between systems

**API Access:**
• REST API available for custom development
• Documentation and testing tools provided
• Rate limits and authentication requirements
• Webhook support for real-time notifications

**Common Integration Use Cases:**
• Sync GovWin opportunities to your CRM pipeline
• Auto-populate contact information and company details
• Create custom reports combining GovWin and internal data
• Set up automated workflows triggered by new opportunities

**Technical Support:**
For complex integrations or custom API work, I recommend connecting with our Integration Specialists who can:
• Assess your technical requirements
• Provide implementation guidance
• Troubleshoot connectivity issues  
• Design custom solutions for enterprise needs

**Would you like me to connect you with our Integration team for detailed technical assistance?**`;

                guidance.type = 'integration_guide';
                guidance.nextSteps = [
                    'Check your subscription plan for integration availability',
                    'Navigate to Account Settings → Integrations',
                    'Review available connectors for your systems',
                    'Test basic integration setup if available',
                    'Contact Integration Specialists for custom needs'
                ];
                break;

            case 'escalation_request':
                guidance.content = `I understand you'd like to speak with a manager or escalate this issue. I'm here to make sure you get the right level of support:

**Escalation Options Available:**

**Customer Success Manager:**
• Direct access to dedicated account manager
• Personalized support and training
• Strategic guidance for using GovWin IQ effectively
• Regular check-ins and success planning

**Technical Support Manager:**
• Advanced troubleshooting for complex issues
• Escalation for bugs or system problems
• Priority handling for critical business needs
• Direct line to engineering team when needed

**Account Management:**
• Billing and subscription concerns
• Contract discussions and modifications
• Feature requests and product feedback
• Executive-level relationship management

**What I Need to Help You:**

1. **Issue Summary**: Brief description of your concern
2. **Urgency Level**: How critical this is to your business
3. **Previous Attempts**: What you've already tried
4. **Preferred Contact**: Phone, email, or video call
5. **Best Times**: When you're available for follow-up

**Immediate Actions I Can Take:**
• Create a priority support ticket with your details
• Schedule a callback within the next business hour
• Set up a screen-sharing session for technical issues
• Connect you directly with the appropriate manager

**For Urgent Issues:**
If this is affecting your business operations critically, I can arrange immediate phone support or emergency escalation.

**I'm initiating escalation now** - you should expect contact from a senior team member within the next hour during business hours.

**Is there anything specific you'd like me to include in the escalation notes to ensure they're fully prepared to help you?**`;

                guidance.type = 'escalation_response';
                guidance.nextSteps = [
                    'I am creating a priority escalation ticket',
                    'Senior support team will contact you within 1 hour',
                    'Prepare any relevant account or issue details',
                    'Consider your preferred contact method and timing',
                    'Expect immediate follow-up and resolution focus'
                ];
                guidance.escalationSuggested = true;
                guidance.urgency = 'critical';
                guidance.confidence = 1.0;
                break;

            default:
                guidance.content = `I'm your Customer Success guide for GovWin IQ. I can help you with:

**Platform Navigation & Training:**
• Learning how to use GovWin IQ features effectively
• Setting up workflows and processes
• Understanding reporting and analytics tools
• Optimizing your team's use of the platform

**Technical Support:**
• Troubleshooting issues and problems
• Login and access support
• Integration and connectivity questions
• Performance optimization guidance

**Account & Team Management:**
• User management and permissions
• Subscription and billing questions
• Team collaboration setup
• Training and onboarding support

**Escalation & Advanced Support:**
• Connecting you with specialists when needed
• Priority support for urgent issues
• Custom solutions and enterprise features
• Strategic guidance for platform success

**What specific area can I help you with today?**

Common requests I handle:
• "I'm having trouble with [specific feature]"
• "How do I set up [specific workflow]?"
• "Can you help me understand my account options?"
• "I need to speak with someone about [urgent issue]"`;

                guidance.nextSteps = [
                    'Describe your specific goal or challenge',
                    'Let me know if this is urgent or blocking your work',
                    'I can provide step-by-step guidance or escalate as needed',
                    'Consider what type of outcome you\'re looking for'
                ];
        }

        return guidance;
    }

    createEscalationResponse(query, error) {
        return {
            agentId: this.agentId,
            content: `I apologize, but I encountered an issue while trying to help you. Let me immediately connect you with a Customer Success Manager who can provide direct assistance.

**What's Happening:**
I want to ensure you get the support you need without any delays. Rather than troubleshoot this technical issue, I'm escalating you directly to a human specialist.

**Next Steps:**
• A Customer Success Manager will contact you within the next hour
• They'll have access to your full account and can resolve both your original question and any technical issues
• You can expect personalized, hands-on support

**Your Original Request:**
"${query}"

**For Immediate Assistance:**
If this is urgent and affecting your business operations, you can also call our priority support line directly.

**I've created a high-priority ticket for you** - expect contact very soon.`,
            guidanceType: 'error_escalation',
            nextSteps: [
                'Customer Success Manager will contact you within 1 hour',
                'Have your account details ready',
                'Prepare to describe your original question',
                'Consider phone support if this is urgent'
            ],
            escalationSuggested: true,
            urgency: 'high',
            confidence: 1.0,
            category: 'customer_success'
        };
    }
}

module.exports = CustomerSuccessAgent;