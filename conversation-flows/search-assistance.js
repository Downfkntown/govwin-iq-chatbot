/**
 * GovWin IQ Search Assistance Conversation Flow
 * Based on Search Methodology from govwin-iq-knowledge-base.md
 */

class SearchAssistanceFlow {
    constructor() {
        this.currentStep = 'initial';
        this.userContext = {
            searchType: null,
            experience: null,
            goals: [],
            filters: {}
        };
    }

    // Main conversation entry point
    handleUserInput(input, context = {}) {
        const intent = this.detectIntent(input);
        return this.routeConversation(intent, input, context);
    }

    // Intent detection for search-related queries
    detectIntent(input) {
        const lowerInput = input.toLowerCase();
        
        if (lowerInput.includes('search') || lowerInput.includes('find') || lowerInput.includes('look for')) {
            if (lowerInput.includes('how') || lowerInput.includes('help')) {
                return 'search_help';
            }
            return 'search_request';
        }
        
        if (lowerInput.includes('filter') || lowerInput.includes('narrow') || lowerInput.includes('refine')) {
            return 'filter_assistance';
        }
        
        if (lowerInput.includes('intellisearch') || lowerInput.includes('advanced search')) {
            return 'search_type_specific';
        }
        
        if (lowerInput.includes('opportunity') || lowerInput.includes('opportunities')) {
            return 'opportunity_search';
        }
        
        return 'general_search';
    }

    // Route conversation based on detected intent
    routeConversation(intent, input, context) {
        switch (intent) {
            case 'search_help':
                return this.searchHelpFlow();
            case 'search_request':
                return this.searchRequestFlow(input);
            case 'filter_assistance':
                return this.filterAssistanceFlow();
            case 'search_type_specific':
                return this.searchTypeSpecificFlow(input);
            case 'opportunity_search':
                return this.opportunitySearchFlow();
            default:
                return this.generalSearchFlow();
        }
    }

    // Search help conversation flow
    searchHelpFlow() {
        return {
            message: `I'd be happy to help you search GovWin IQ effectively! 

GovWin IQ offers two main search approaches:

🔍 **IntelliSearch (Quick Start)**
- Fast database query with suggested results
- Great for initial exploration and broad topics
- Remember: Multi-word phrases need quotation marks

🎯 **Advanced Search (Precise Control)**
- Segmented database querying (Opportunities, Contracts, Task Orders)
- Full filter range access for targeted searches
- Best for specific requirements

Which type of search would you like to learn about, or do you have a specific search goal in mind?`,
            options: [
                'Tell me about IntelliSearch',
                'Explain Advanced Search',
                'Help me find specific opportunities',
                'Show me search filters'
            ],
            followUp: 'search_type_selection'
        };
    }

    // Search request flow
    searchRequestFlow(input) {
        return {
            message: `I'll help you find what you're looking for! To give you the best search strategy, could you tell me:

1. **What type of opportunities are you seeking?** (e.g., IT services, construction, consulting)
2. **Which government market?** (Federal, SLED/MASH, or Canadian)
3. **Are you looking for active opportunities or planning ahead?**

Based on your needs, I can recommend whether to use IntelliSearch for quick exploration or Advanced Search for precise targeting.`,
            collectInfo: ['opportunity_type', 'government_market', 'timeline'],
            followUp: 'search_strategy_recommendation'
        };
    }

    // Filter assistance flow
    filterAssistanceFlow() {
        return {
            message: `Great! Let me guide you through GovWin IQ's powerful search filters:

🔑 **Essential Search Filters:**

**Keywords**
- Target precise language within project content
- Support Boolean logic (AND, OR, NOT)
- Quote multi-word phrases: "web design services"

**Government Types**
- Choose Federal vs SLED/MASH vs Canadian markets
- Navigate hierarchy: Agency → Sub-agency → Department
- Hold CTRL + click for multiple selections

**Smart Tags**
- Algorithm-based project categorization
- Browse all tags or type to auto-suggest
- Use "Primary Tags Only" for main focus

**Status Filters**
- Federal: Pre-RFP, Post-RFP, Any Active
- SLED: Forecast Pre-RFP, Source Selection, Open Enrollment

Which filter would you like to explore in detail?`,
            options: [
                'Keywords and Boolean search',
                'Government Types selection',
                'Smart Tags usage',
                'Status Filters explained'
            ],
            followUp: 'filter_deep_dive'
        };
    }

    // Search type specific flow
    searchTypeSpecificFlow(input) {
        const isIntelliSearch = input.toLowerCase().includes('intellisearch');
        
        if (isIntelliSearch) {
            return {
                message: `**IntelliSearch (Quick Start)** is perfect for:

✅ **When to use:**
- Initial exploration of opportunities
- Broad topic searches
- Getting quick suggestions and recommendations

⚡ **Key features:**
- Fast database query with suggested results
- Automatic recommendations for broader searches
- **Important:** Multi-word phrases REQUIRE quotation marks

📝 **Best practices:**
- Start with general terms
- Use quotes for specific phrases: "cybersecurity services"
- Review suggested results for broader searches
- Great for discovering unexpected opportunities

Ready to try an IntelliSearch? What topic would you like to explore?`,
                followUp: 'intellisearch_practice'
            };
        } else {
            return {
                message: `**Advanced Search (Precise Control)** gives you:

🎯 **When to use:**
- Targeted searches with specific requirements
- Need full filter range access
- Want custom criteria combinations

🔧 **Key capabilities:**
- Segmented database querying (Opportunities, Contracts, Task Orders, etc.)
- Complete filter control
- Custom criteria combinations
- Precise targeting

📊 **Best for:**
- Experienced users who know exactly what they want
- Complex search requirements
- Multiple filter combinations
- Detailed market research

Would you like me to walk you through setting up an Advanced Search, or do you have specific criteria in mind?`,
                followUp: 'advanced_search_setup'
            };
        }
    }

    // Opportunity search flow
    opportunitySearchFlow() {
        return {
            message: `Let's find the right government opportunities for you! 

**Quick Assessment:**
- Are you new to GovWin IQ searching? → I'll recommend **IntelliSearch**
- Have specific requirements and know your filters? → **Advanced Search** is better

**Search Results Optimization:**
📊 **View Options:** List View (default), Grid View, Chart View
🔄 **Sorting:** Created Date, Solicitation Date, Value, Relevance  
📈 **Dynamic Infographic:** Visual market analysis (golden arrow icon)
🎯 **Narrow Results:** Use left sidebar for additional filtering
📤 **Export Options:** Excel (customizable fields) or PDF

What's your experience level with GovWin IQ?`,
            options: [
                'New user - need guidance',
                'Experienced - want advanced features',
                'Help me choose the right approach',
                'Show me result optimization tips'
            ],
            followUp: 'experience_based_guidance'
        };
    }

    // General search flow
    generalSearchFlow() {
        return {
            message: `I'm here to help you master GovWin IQ searching! 

**I can assist with:**
🔍 Choosing between IntelliSearch and Advanced Search
🎯 Setting up effective search filters
📊 Optimizing your search results
💡 Best practices for finding opportunities
🤝 Sharing and saving your searches

**Quick question:** Are you trying to find opportunities, research competitors, or set up alerts?

This will help me provide the most relevant guidance for your needs.`,
            options: [
                'Find opportunities',
                'Research competitors',
                'Set up search alerts',
                'Learn search best practices'
            ],
            followUp: 'goal_based_assistance'
        };
    }

    // Validate user input and provide feedback
    validateSearchInput(input) {
        const validation = {
            hasQuotedPhrases: /["'][^"']+["']/.test(input),
            hasBooleanOperators: /\b(AND|OR|NOT)\b/i.test(input),
            multiWordWithoutQuotes: /\b\w+\s+\w+\b/.test(input) && !/["'][^"']+["']/.test(input)
        };

        const suggestions = [];
        
        if (validation.multiWordWithoutQuotes) {
            suggestions.push("💡 Tip: Multi-word phrases work better in quotes, like \"web design services\"");
        }
        
        if (!validation.hasBooleanOperators && input.includes(' ')) {
            suggestions.push("💡 Consider using Boolean operators: AND, OR, NOT for more precise results");
        }

        return {
            isValid: true,
            suggestions: suggestions
        };
    }

    // Progress tracking for conversation flow
    updateProgress(step, data = {}) {
        this.currentStep = step;
        Object.assign(this.userContext, data);
        
        return {
            step: this.currentStep,
            context: this.userContext,
            completionPercentage: this.calculateProgress()
        };
    }

    calculateProgress() {
        const totalSteps = 5;
        const stepMap = {
            'initial': 0,
            'search_type_selection': 1,
            'filter_setup': 2,
            'search_execution': 3,
            'results_optimization': 4,
            'completed': 5
        };
        
        return Math.round((stepMap[this.currentStep] / totalSteps) * 100);
    }

    // Generate contextual follow-up questions
    generateFollowUp(currentResponse) {
        const followUps = {
            'search_help': [
                "Would you like to try a practice search?",
                "Do you have specific search criteria in mind?",
                "Should I explain the search filters in detail?"
            ],
            'filter_assistance': [
                "Which government market interests you most?",
                "Do you want to practice building a search query?",
                "Should I show you some example searches?"
            ],
            'search_strategy_recommendation': [
                "Ready to execute this search strategy?",
                "Would you like me to suggest specific keywords?",
                "Do you want to save this search for alerts?"
            ]
        };

        return followUps[currentResponse.followUp] || [
            "Does this make sense so far?",
            "Would you like me to explain it another way?",
            "Ready to move to the next step?"
        ];
    }
}

// Export for use in chatbot implementation
module.exports = SearchAssistanceFlow;