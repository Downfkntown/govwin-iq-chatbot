/**
 * Search & Navigation Agent
 * 
 * Purpose: Guides users through GovWin's search tools and navigation features
 * Focus: Teaching HOW to use GovWin's built-in search, filters, and discovery tools
 * Does NOT: Replicate search functionality - teaches users where to find and how to use it
 */

class SearchNavigationAgent {
    constructor(logger) {
        this.logger = logger;
        this.agentId = 'search-navigation';
        this.capabilities = [
            'search_guidance',
            'filter_navigation', 
            'opportunity_discovery',
            'search_optimization',
            'saved_searches',
            'alert_setup',
            'navigation_tutorials'
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
        
        // Search functionality guidance
        if (queryLower.includes('how') && (queryLower.includes('search') || queryLower.includes('find'))) {
            if (queryLower.includes('federal')) return 'federal_search_how_to';
            if (queryLower.includes('sled') || queryLower.includes('state') || queryLower.includes('local')) return 'sled_search_how_to';
            return 'general_search_how_to';
        }
        
        // Filter and refinement guidance
        if (queryLower.includes('filter') || queryLower.includes('narrow') || queryLower.includes('refine')) {
            return 'filter_guidance';
        }
        
        // Saved searches and alerts
        if (queryLower.includes('save') && queryLower.includes('search')) return 'saved_search_setup';
        if (queryLower.includes('alert') || queryLower.includes('notification') || queryLower.includes('monitor')) return 'alert_setup_guidance';
        
        // Advanced search features
        if (queryLower.includes('advanced') || queryLower.includes('complex')) return 'advanced_search_guidance';
        
        // Navigation and location guidance
        if (queryLower.includes('where') && (queryLower.includes('find') || queryLower.includes('located'))) {
            return 'navigation_guidance';
        }
        
        // Opportunity-specific search guidance
        if (queryLower.includes('opportunity') || queryLower.includes('opportunities')) {
            if (queryLower.includes('federal')) return 'federal_opportunity_search';
            if (queryLower.includes('sled') || queryLower.includes('state') || queryLower.includes('local')) return 'sled_opportunity_search';
            return 'opportunity_search_general';
        }
        
        return 'general_search_guidance';
    }

    async generateSearchGuidance(intent, query, context) {
        const guidance = {
            content: '',
            type: 'search_guidance',
            nextSteps: [],
            navigationPath: [],
            confidence: 0.8
        };

        switch (intent) {
            case 'federal_search_how_to':
                guidance.content = `I'll guide you through searching for federal opportunities in GovWin IQ:

**Step-by-Step Federal Search:**

1. **Navigate to Search**
   • Click "Opportunities" in the main navigation
   • Select "Advanced Search" for comprehensive filtering

2. **Set Market Focus**
   • In the Market filter, select "Federal"
   • This focuses your search on federal agencies and contracts

3. **Apply Agency Filters**
   • Use the "Agency" dropdown to target specific departments
   • Popular choices: DoD, DHS, GSA, VA, NASA, etc.

4. **Industry & Classification**
   • Select your NAICS codes under "Industry"
   • Add PSC (Product Service Codes) if applicable

5. **Timeline & Value Filters**
   • Set "Posted Date" range for recent opportunities
   • Use "Estimated Value" to match your capacity

**Pro Tips:**
• Use "Keyword" search for specific technologies or requirements
• Save successful searches for quick access
• Set up alerts to monitor new postings automatically`;

                guidance.type = 'federal_search_tutorial';
                guidance.nextSteps = [
                    'Navigate to Opportunities → Advanced Search',
                    'Set Market filter to "Federal"',
                    'Apply relevant agency and industry filters',
                    'Execute search and review results',
                    'Save search criteria for future use',
                    'Set up monitoring alerts'
                ];
                guidance.navigationPath = ['Opportunities', 'Advanced Search', 'Market: Federal'];
                guidance.confidence = 0.9;
                break;

            case 'sled_search_how_to':
                guidance.content = `I'll walk you through searching SLED (State, Local, Education) opportunities in GovWin IQ:

**Step-by-Step SLED Search:**

1. **Access SLED Search**
   • Go to "Opportunities" → "Advanced Search"
   • Select "SLED" in the Market filter

2. **Geographic Targeting**
   • Use "State" filter to focus on specific states
   • Add "City" or "County" for local targeting
   • Select "Region" for broader geographic searches

3. **Sector Selection**
   • Choose relevant sectors: Education, Healthcare, Transportation, etc.
   • Use "Entity Type" to target: State Gov, School District, Municipality

4. **Procurement Cycle Timing**
   • Check "Fiscal Year" settings for budget cycles
   • Use "Posted Date" to find recent opportunities
   • Consider "Response Due Date" for timing

5. **Value and Scope**
   • Set "Estimated Value" ranges appropriate for SLED
   • Use "Procurement Method" filters (RFP, IFB, etc.)

**SLED-Specific Tips:**
• Monitor budget cycles (July-June for most states)
• Watch for cooperative purchasing opportunities
• Set geographic alerts for your target markets`;

                guidance.type = 'sled_search_tutorial';
                guidance.nextSteps = [
                    'Go to Opportunities → Advanced Search',
                    'Select SLED in Market filter',
                    'Set geographic targeting (State/Region)',
                    'Choose relevant sectors and entity types',
                    'Apply procurement cycle filters',
                    'Save search and create alerts'
                ];
                guidance.navigationPath = ['Opportunities', 'Advanced Search', 'Market: SLED'];
                guidance.confidence = 0.9;
                break;

            case 'filter_guidance':
                guidance.content = `I'll help you master GovWin IQ's filtering system to refine your searches:

**Essential Search Filters:**

**Basic Filters:**
• **Market**: Federal, SLED, or Both
• **Keywords**: Search opportunity titles and descriptions
• **Posted Date**: Control recency (Last 30 days, etc.)
• **Status**: Active, Upcoming, Awarded, Cancelled

**Advanced Filters:**

**Federal-Specific:**
• **Agency**: Department-level targeting
• **Sub-Agency**: Bureau/office level precision
• **PSC Code**: Product Service Classification
• **Contract Vehicle**: GSA, CIO-SP3, SEWP, etc.

**SLED-Specific:**
• **State/Region**: Geographic targeting
• **Entity Type**: State, County, City, School District
• **Sector**: Education, Transportation, Health, etc.

**Universal Filters:**
• **Industry (NAICS)**: Your business classification
• **Estimated Value**: Match your capacity
• **Set-Aside Type**: Small Business, 8(a), HUBZone, etc.
• **Procurement Method**: RFP, RFQ, IFB, etc.

**Filter Strategy Tips:**
• Start broad, then narrow with specific filters
• Use multiple keywords with OR/AND logic
• Save successful filter combinations
• Monitor with alerts when filters work well`;

                guidance.type = 'filter_tutorial';
                guidance.nextSteps = [
                    'Start with Market filter (Federal or SLED)',
                    'Add geographic or agency targeting',
                    'Apply industry/classification filters',
                    'Set value and timeline parameters',
                    'Test and refine filter combinations',
                    'Save effective filter sets'
                ];
                break;

            case 'alert_setup_guidance':
                guidance.content = `I'll show you how to set up monitoring alerts in GovWin IQ to stay informed automatically:

**Setting Up Search Alerts:**

1. **Create Your Perfect Search**
   • Use Advanced Search to set all desired filters
   • Test the search to ensure good results
   • Refine filters until you get quality matches

2. **Save the Search**
   • Click "Save Search" after running your query
   • Give it a descriptive name
   • Add notes about the search purpose

3. **Configure Alert Settings**
   • Choose alert frequency: Daily, Weekly, or Real-time
   • Select delivery method: Email or Dashboard
   • Set alert sensitivity (new vs. updated opportunities)

4. **Alert Types Available:**
   • **New Opportunities**: Get notified of brand new postings
   • **Updated Opportunities**: Changes to existing postings
   • **Award Information**: Contract award announcements
   • **Amendment Notices**: Modifications to active opportunities

**Alert Management Best Practices:**
• Start with daily frequency to gauge volume
• Use specific searches to reduce noise
• Set up separate alerts for different markets
• Review and update alerts monthly
• Pause alerts during vacations or busy periods

**Advanced Alert Features:**
• Keyword highlighting in alert emails
• Summary digest options
• Mobile notifications through the app
• Integration with calendar systems`;

                guidance.type = 'alert_setup_tutorial';
                guidance.nextSteps = [
                    'Create and test your target search',
                    'Save the search with descriptive name',
                    'Configure alert frequency and delivery',
                    'Test alert by running initial notification',
                    'Monitor alert quality and adjust as needed',
                    'Set up additional alerts for different focuses'
                ];
                break;

            case 'navigation_guidance':
                guidance.content = `I'll help you navigate GovWin IQ efficiently and find the tools you need:

**Main Navigation Areas:**

**Dashboard**
• Your personalized home base
• Recent activity and quick access
• Saved searches and alert summaries
• Key metrics and performance indicators

**Opportunities**
• **Browse**: Quick category-based searching
• **Advanced Search**: Full filtering capabilities
• **Saved Searches**: Your custom search library
• **Alerts**: Monitoring and notification center

**Intelligence**
• Market research and trends
• Agency spending patterns
• Competitor intelligence
• Industry analysis and forecasting

**Tools & Features**
• **Pipeline Management**: Track your opportunities
• **Team Collaboration**: Share and coordinate
• **Reports**: Generate custom analysis
• **Integrations**: Connect with your CRM/ERP

**Quick Navigation Tips:**
• Use the search bar at the top for quick keyword searches
• Bookmark frequently used advanced searches
• Customize your dashboard widgets
• Use browser bookmarks for deep-linked searches

**Mobile Navigation:**
• Download the GovWin IQ mobile app
• Access saved searches on the go
• Receive push notifications for alerts
• Quick opportunity details and contact info

**Keyboard Shortcuts:**
• Ctrl+K: Quick search
• Ctrl+S: Save current search
• Ctrl+D: Add to dashboard
• Tab navigation through filter options`;

                guidance.type = 'navigation_tutorial';
                guidance.nextSteps = [
                    'Explore the main navigation menu',
                    'Customize your dashboard layout',
                    'Set up your most-used bookmarks',
                    'Download and configure the mobile app',
                    'Practice using keyboard shortcuts',
                    'Organize your saved searches'
                ];
                break;

            default:
                guidance.content = `I'll help you navigate GovWin IQ's search and discovery tools effectively:

**I can guide you through:**

**Search & Discovery:**
• How to use Advanced Search effectively
• Federal vs. SLED search strategies
• Filter optimization and combinations
• Keyword search techniques

**Monitoring & Alerts:**
• Setting up automated opportunity monitoring
• Configuring alert frequencies and types
• Managing and organizing your alerts
• Mobile notifications setup

**Navigation & Organization:**
• Finding tools and features in GovWin IQ
• Customizing your dashboard and workflow
• Saving and organizing searches
• Using shortcuts and efficiency tips

**What specific search or navigation challenge can I help you with?**

Common requests:
• "How do I search for federal opportunities?"
• "Where do I set up alerts for new postings?"
• "How do I filter by specific agencies or states?"
• "Can you show me how to save my searches?"`;

                guidance.nextSteps = [
                    'Tell me your specific search goal',
                    'Let me know your target market (Federal/SLED)',
                    'I can provide step-by-step navigation guidance',
                    'We can set up monitoring for ongoing needs'
                ];
        }

        return guidance;
    }

    createFallbackResponse(query) {
        return {
            agentId: this.agentId,
            content: `I'm your Search & Navigation guide for GovWin IQ. I can help you:

• Learn how to search for opportunities effectively
• Navigate GovWin IQ's tools and features  
• Set up monitoring alerts and saved searches
• Optimize your search strategies and filters

What specific search or navigation challenge can I help you with today?`,
            guidanceType: 'search_navigation_fallback',
            nextSteps: [
                'Describe your search or navigation goal',
                'Let me know if you need federal or SLED guidance',
                'I can provide step-by-step instructions'
            ],
            confidence: 0.6,
            category: 'search_navigation'
        };
    }
}

module.exports = SearchNavigationAgent;