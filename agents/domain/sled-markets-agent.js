/**
 * SLED Markets Agent
 * 
 * Specialized agent for State, Local, and Education markets with expertise in:
 * - Municipal procurement processes and requirements
 * - State contracting regulations and procedures
 * - Education sector workflows (K-12, Higher Ed)
 * - SLED-specific search methodologies and platforms
 * - Local government compliance and certification requirements
 * - Regional market analysis and opportunity identification
 * - Cooperative purchasing programs and consortiums
 */

class SLEDMarketsAgent {
    constructor() {
        this.agentId = 'sled-markets';
        this.name = 'SLED Markets Specialist';
        this.version = '1.0.0';
        
        this.expertise = [
            'state procurement',
            'local government contracting',
            'municipal procurement',
            'education sector',
            'K-12 contracting',
            'higher education',
            'cooperative purchasing',
            'regional compliance'
        ];
        
        this.capabilities = [
            'state_procurement_analysis',
            'municipal_process_guidance',
            'education_sector_intelligence',
            'sled_search_optimization',
            'local_compliance_assessment',
            'regional_market_analysis',
            'cooperative_program_identification',
            'vendor_registration_guidance'
        ];
        
        this.initializeKnowledgeBases();
    }

    /**
     * Initialize SLED market knowledge bases
     */
    initializeKnowledgeBases() {
        // State procurement structures and thresholds
        this.stateProcurementSystems = {
            'california': {
                name: 'California',
                centralAgency: 'Department of General Services (DGS)',
                procurementPortal: 'Cal eProcure',
                smallBusinessThreshold: '$250,000',
                formalBidThreshold: '$100,000',
                certifications: ['Small Business', 'DVBE', 'Microbusiness'],
                keyFeatures: ['Master Agreements', 'CMAS contracts', 'Leveraged Procurement Agreements'],
                fiscalYear: 'July 1 - June 30'
            },
            'texas': {
                name: 'Texas',
                centralAgency: 'Texas Comptroller of Public Accounts',
                procurementPortal: 'TXMAS (Texas Multiple Award Schedule)',
                smallBusinessThreshold: '$25,000',
                formalBidThreshold: '$50,000',
                certifications: ['HUB (Historically Underutilized Business)'],
                keyFeatures: ['DIR contracts', 'Cooperative contracts', 'Term contracts'],
                fiscalYear: 'September 1 - August 31'
            },
            'newyork': {
                name: 'New York',
                centralAgency: 'Office of General Services (OGS)',
                procurementPortal: 'NYS Procurement Portal',
                smallBusinessThreshold: '$200,000',
                formalBidThreshold: '$85,000',
                certifications: ['MWBE', 'SDVOB', 'Small Business'],
                keyFeatures: ['Centralized contracts', 'Preferred sources', 'Best value awards'],
                fiscalYear: 'April 1 - March 31'
            },
            'florida': {
                name: 'Florida',
                centralAgency: 'Department of Management Services (DMS)',
                procurementPortal: 'MyFloridaMarketPlace',
                smallBusinessThreshold: '$35,000',
                formalBidThreshold: '$35,000',
                certifications: ['Small Business Enterprise', 'Minority Business Enterprise'],
                keyFeatures: ['State term contracts', 'Technology contracts', 'Professional services'],
                fiscalYear: 'July 1 - June 30'
            }
        };

        // Municipal procurement characteristics
        this.municipalProcurementTypes = {
            'major_cities': {
                category: 'Major Cities (500K+ population)',
                characteristics: [
                    'Formal procurement departments',
                    'Structured RFP/RFQ processes',
                    'Vendor registration systems',
                    'Local preference programs'
                ],
                thresholds: {
                    informal: '$5,000 - $25,000',
                    formal: '$25,000 - $100,000+',
                    council_approval: '$100,000+'
                },
                commonCertifications: ['MBE', 'WBE', 'Local Business', 'Small Business'],
                procurementCycles: 'Quarterly or annual budget cycles'
            },
            'mid_size_cities': {
                category: 'Mid-size Cities (100K-500K population)',
                characteristics: [
                    'City manager or procurement officer',
                    'Quote-based systems',
                    'Board/council involvement',
                    'Regional cooperation'
                ],
                thresholds: {
                    informal: '$2,500 - $15,000',
                    formal: '$15,000 - $50,000',
                    council_approval: '$50,000+'
                },
                commonCertifications: ['Local Business', 'Disadvantaged Business'],
                procurementCycles: 'Budget-driven, often annual'
            },
            'small_cities': {
                category: 'Small Cities & Towns (<100K population)',
                characteristics: [
                    'Limited procurement staff',
                    'Relationship-based purchasing',
                    'State contract utilization',
                    'Cooperative purchasing participation'
                ],
                thresholds: {
                    informal: '$1,000 - $10,000',
                    formal: '$10,000 - $25,000',
                    council_approval: '$25,000+'
                },
                commonCertifications: ['Local preference only'],
                procurementCycles: 'As-needed basis'
            }
        };

        // Education sector structure
        this.educationSectors = {
            'k12_districts': {
                name: 'K-12 School Districts',
                governance: 'School boards, superintendents',
                budgetCycles: 'Annual (July-June typical)',
                keyProcurementAreas: [
                    'Technology and equipment',
                    'Transportation services',
                    'Food services',
                    'Facilities and maintenance',
                    'Professional development',
                    'Educational services and curriculum'
                ],
                procurementThresholds: {
                    small: '$5,000 - $15,000',
                    medium: '$15,000 - $50,000',
                    large: '$50,000+',
                    board_approval: '$25,000+'
                },
                specialConsiderations: [
                    'Summer procurement seasons',
                    'Federal funding requirements (Title I, IDEA)',
                    'State education regulations',
                    'E-rate telecommunications funding'
                ]
            },
            'higher_education': {
                name: 'Higher Education (Colleges & Universities)',
                governance: 'Board of trustees, regents, presidents',
                budgetCycles: 'Annual or biennial',
                keyProcurementAreas: [
                    'Research equipment and supplies',
                    'IT infrastructure and software',
                    'Facilities and construction',
                    'Professional services',
                    'Food services and hospitality',
                    'Healthcare and student services'
                ],
                procurementThresholds: {
                    small: '$10,000 - $25,000',
                    medium: '$25,000 - $100,000',
                    large: '$100,000+',
                    board_approval: '$100,000+'
                },
                specialConsiderations: [
                    'Academic calendar alignment',
                    'Research grant requirements',
                    'Sustainability mandates',
                    'Student involvement requirements'
                ]
            },
            'community_colleges': {
                name: 'Community Colleges',
                governance: 'Local boards, state oversight',
                budgetCycles: 'Annual (varies by state)',
                keyProcurementAreas: [
                    'Workforce development programs',
                    'Technology and equipment',
                    'Facilities maintenance',
                    'Student support services',
                    'Continuing education programs'
                ],
                procurementThresholds: {
                    small: '$5,000 - $20,000',
                    medium: '$20,000 - $75,000',
                    large: '$75,000+',
                    board_approval: '$50,000+'
                },
                specialConsiderations: [
                    'State funding formulas',
                    'Local industry partnerships',
                    'Federal workforce development grants'
                ]
            }
        };

        // Cooperative purchasing programs
        this.cooperativePrograms = {
            'naspo': {
                name: 'NASPO ValuePoint',
                description: 'National Association of State Procurement Officials cooperative contracts',
                participation: 'State governments and eligible entities',
                categories: ['IT', 'Professional Services', 'Equipment', 'Facilities'],
                benefits: ['Pre-competed contracts', 'Aggregated purchasing power', 'Streamlined procurement'],
                website: 'https://www.naspovaluepoint.org'
            },
            'omnia': {
                name: 'OMNIA Partners',
                description: 'Largest purchasing cooperative in North America',
                participation: 'Public agencies, non-profits, K-12, higher education',
                categories: ['Technology', 'Facilities', 'Fleet', 'Public Safety'],
                benefits: ['No membership fees', 'Pre-negotiated contracts', 'Local support'],
                website: 'https://www.omniapartners.com'
            },
            'tips': {
                name: 'TIPS (The Interlocal Purchasing System)',
                description: 'Texas-based cooperative serving multiple states',
                participation: 'Government entities, schools, non-profits',
                categories: ['Technology', 'Construction', 'Professional Services', 'Equipment'],
                benefits: ['Competitive solicitation', 'Legal compliance', 'Vendor management'],
                website: 'https://www.tips-usa.com'
            },
            'sourcewell': {
                name: 'Sourcewell',
                description: 'Public procurement cooperative',
                participation: 'Government, education, non-profit organizations',
                categories: ['Technology', 'Vehicles', 'Equipment', 'Services'],
                benefits: ['No membership fees', 'Cooperative purchasing power', 'Contract expertise'],
                website: 'https://www.sourcewell-mn.gov'
            }
        };

        // SLED search platforms and resources
        this.sledSearchPlatforms = {
            'state_portals': {
                category: 'State Procurement Portals',
                examples: [
                    'Cal eProcure (California)',
                    'TXMAS (Texas)', 
                    'NYS Procurement Portal (New York)',
                    'MyFloridaMarketPlace (Florida)',
                    'COMPASS (Georgia)'
                ],
                searchFeatures: ['Vendor registration', 'Opportunity alerts', 'Award histories'],
                bestPractices: [
                    'Register in multiple state systems',
                    'Set up automated alerts',
                    'Monitor amendment notices',
                    'Track award patterns'
                ]
            },
            'municipal_resources': {
                category: 'Municipal/Local Resources',
                examples: [
                    'City and county websites',
                    'BidNet',
                    'GovSpend',
                    'Regional procurement consortiums'
                ],
                searchFeatures: ['Local preferences', 'Informal solicitations', 'Emergency procurement'],
                bestPractices: [
                    'Build local relationships',
                    'Attend city council meetings',
                    'Monitor local newspapers',
                    'Join local business associations'
                ]
            },
            'education_platforms': {
                category: 'Education Sector Resources',
                examples: [
                    'District websites and portals',
                    'State education department sites',
                    'Higher education procurement pages',
                    'Education cooperatives'
                ],
                searchFeatures: ['Academic calendars', 'Budget cycles', 'Federal funding opportunities'],
                bestPractices: [
                    'Understand academic calendars',
                    'Monitor federal education grants',
                    'Build relationships with procurement staff',
                    'Attend education conferences'
                ]
            }
        };

        // Regional market characteristics
        this.regionalCharacteristics = {
            'northeast': {
                region: 'Northeast',
                states: ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA'],
                characteristics: [
                    'Strong preference for local businesses',
                    'Complex regulatory environments',
                    'High education spending',
                    'Mature procurement systems'
                ],
                opportunities: ['Education technology', 'Infrastructure', 'Professional services'],
                challenges: ['High competition', 'Complex compliance', 'Relationship-based markets']
            },
            'southeast': {
                region: 'Southeast',
                states: ['DE', 'MD', 'VA', 'WV', 'KY', 'TN', 'NC', 'SC', 'GA', 'FL', 'AL', 'MS', 'AR', 'LA'],
                characteristics: [
                    'Growing markets with expanding populations',
                    'Business-friendly environments',
                    'Emerging technology adoption',
                    'Strong cooperative purchasing'
                ],
                opportunities: ['Technology modernization', 'Transportation', 'Economic development'],
                challenges: ['Varied procurement maturity', 'Budget constraints', 'Political considerations']
            },
            'midwest': {
                region: 'Midwest',
                states: ['OH', 'IN', 'IL', 'MI', 'WI', 'MN', 'IA', 'MO', 'ND', 'SD', 'NE', 'KS'],
                characteristics: [
                    'Collaborative procurement approaches',
                    'Strong manufacturing base',
                    'Agricultural influences',
                    'Conservative spending patterns'
                ],
                opportunities: ['Infrastructure', 'Agriculture technology', 'Manufacturing support'],
                challenges: ['Budget limitations', 'Conservative adoption', 'Rural access issues']
            },
            'west': {
                region: 'West',
                states: ['MT', 'WY', 'CO', 'NM', 'ID', 'UT', 'AZ', 'NV', 'WA', 'OR', 'CA', 'AK', 'HI'],
                characteristics: [
                    'Innovation-focused procurement',
                    'Environmental considerations',
                    'Technology leadership',
                    'Diverse market sizes'
                ],
                opportunities: ['Clean technology', 'Innovation solutions', 'Sustainability services'],
                challenges: ['High standards', 'Environmental compliance', 'Cost considerations']
            }
        };
    }

    /**
     * Analyze state procurement opportunities and requirements
     */
    analyzeStateProcurement(query, targetStates = [], userProfile = {}) {
        const analysis = {
            targetStates: [],
            procurementRequirements: [],
            registrationNeeds: [],
            opportunityTypes: [],
            competitiveFactors: []
        };

        // Determine target states from query or use provided list
        const identifiedStates = targetStates.length > 0 ? 
            targetStates : this.identifyStatesFromQuery(query);

        identifiedStates.forEach(stateKey => {
            const stateInfo = this.stateProcurementSystems[stateKey.toLowerCase()];
            if (stateInfo) {
                analysis.targetStates.push({
                    ...stateInfo,
                    opportunities: this.assessStateOpportunities(stateInfo, query, userProfile),
                    barriers: this.identifyStateBarriers(stateInfo, userProfile),
                    strategy: this.generateStateStrategy(stateInfo, query)
                });
            }
        });

        // General requirements analysis
        analysis.procurementRequirements = this.analyzeGeneralStateRequirements(query);
        analysis.registrationNeeds = this.assessRegistrationRequirements(analysis.targetStates);
        analysis.opportunityTypes = this.identifyStateOpportunityTypes(query, userProfile);

        return analysis;
    }

    /**
     * Analyze municipal procurement processes
     */
    analyzeMunicipalProcurement(query, citySize = 'mid_size_cities', userProfile = {}) {
        const municipalType = this.municipalProcurementTypes[citySize];
        
        const analysis = {
            procurementStructure: municipalType,
            processRequirements: this.getMunicipalProcessRequirements(municipalType, query),
            thresholdGuidance: this.generateThresholdGuidance(municipalType),
            localPreferences: this.analyzeLocalPreferences(query, userProfile),
            relationshipStrategy: this.generateRelationshipStrategy(municipalType),
            complianceRequirements: this.getMunicipalCompliance(municipalType)
        };

        return analysis;
    }

    /**
     * Analyze education sector opportunities
     */
    analyzeEducationSector(query, sector = null, userProfile = {}) {
        const sectors = sector ? [sector] : this.identifyEducationSectorsFromQuery(query);
        
        const analysis = {
            applicableSectors: [],
            procurementCycles: {},
            budgetConsiderations: {},
            specialRequirements: [],
            opportunityTiming: {}
        };

        sectors.forEach(sectorKey => {
            const sectorInfo = this.educationSectors[sectorKey];
            if (sectorInfo) {
                analysis.applicableSectors.push({
                    ...sectorInfo,
                    opportunities: this.assessEducationOpportunities(sectorInfo, query, userProfile),
                    timing: this.analyzeEducationTiming(sectorInfo),
                    funding: this.analyzeFundingSources(sectorInfo, query)
                });
            }
        });

        // Cross-sector analysis
        analysis.procurementCycles = this.analyzeEducationCycles(analysis.applicableSectors);
        analysis.budgetConsiderations = this.getEducationBudgetFactors(analysis.applicableSectors);
        analysis.specialRequirements = this.getEducationSpecialRequirements(query);

        return analysis;
    }

    /**
     * Optimize SLED-specific search methodologies
     */
    optimizeSLEDSearch(searchCriteria, targetMarkets = ['state', 'local', 'education']) {
        const optimization = {
            searchStrategy: {},
            platformRecommendations: [],
            keywordOptimization: {},
            monitoringSetup: {},
            relationshipBuilding: {}
        };

        // Platform-specific strategies
        targetMarkets.forEach(market => {
            const platformInfo = this.sledSearchPlatforms[`${market}_portals`] || 
                              this.sledSearchPlatforms[`${market}_resources`];
            
            if (platformInfo) {
                optimization.platformRecommendations.push({
                    market,
                    ...platformInfo,
                    customStrategy: this.generateMarketSearchStrategy(market, searchCriteria)
                });
            }
        });

        // Keyword optimization
        optimization.keywordOptimization = this.generateSLEDKeywords(searchCriteria, targetMarkets);

        // Monitoring setup
        optimization.monitoringSetup = this.generateSLEDMonitoring(targetMarkets, searchCriteria);

        // Relationship building strategy
        optimization.relationshipBuilding = this.generateRelationshipBuildingStrategy(targetMarkets);

        return optimization;
    }

    /**
     * Assess local government compliance requirements
     */
    assessLocalCompliance(query, jurisdiction = 'general', userProfile = {}) {
        const compliance = {
            generalRequirements: [],
            certificationOpportunities: [],
            registrationProcesses: [],
            ongoingObligations: [],
            riskFactors: []
        };

        // General compliance requirements
        compliance.generalRequirements = [
            'Business license in jurisdiction',
            'Insurance requirements (general liability, professional)',
            'Tax compliance and good standing',
            'Bonding requirements (if applicable)',
            'Local business registration'
        ];

        // Certification opportunities
        compliance.certificationOpportunities = this.identifyLocalCertifications(jurisdiction, userProfile);

        // Registration processes
        compliance.registrationProcesses = this.getRegistrationGuidance(jurisdiction);

        // Ongoing obligations
        compliance.ongoingObligations = [
            'Annual registration renewals',
            'Compliance reporting requirements',
            'Local tax obligations',
            'Performance bond maintenance',
            'Insurance coverage maintenance'
        ];

        // Risk factors
        compliance.riskFactors = this.identifyComplianceRisks(jurisdiction, query);

        return compliance;
    }

    /**
     * Conduct regional market analysis
     */
    analyzeRegionalMarket(query, region = null, userProfile = {}) {
        const targetRegions = region ? [region] : this.identifyRegionsFromQuery(query);
        
        const analysis = {
            regionalProfiles: [],
            marketOpportunities: [],
            competitiveLandscape: {},
            strategicRecommendations: [],
            entryStrategies: []
        };

        targetRegions.forEach(regionKey => {
            const regionInfo = this.regionalCharacteristics[regionKey.toLowerCase()];
            if (regionInfo) {
                analysis.regionalProfiles.push({
                    ...regionInfo,
                    marketSize: this.estimateRegionalMarketSize(regionInfo, query),
                    competitionLevel: this.assessRegionalCompetition(regionInfo, query),
                    entryBarriers: this.identifyRegionalBarriers(regionInfo),
                    successFactors: this.getRegionalSuccessFactors(regionInfo)
                });
            }
        });

        // Cross-regional analysis
        analysis.marketOpportunities = this.identifyRegionalOpportunities(analysis.regionalProfiles, query);
        analysis.competitiveLandscape = this.analyzeRegionalCompetition(analysis.regionalProfiles);
        analysis.strategicRecommendations = this.generateRegionalStrategy(analysis.regionalProfiles, userProfile);

        return analysis;
    }

    /**
     * Identify cooperative purchasing opportunities
     */
    identifyCooperativeOpportunities(query, userProfile = {}) {
        const opportunities = {
            eligiblePrograms: [],
            applicationProcesses: [],
            benefitAnalysis: {},
            strategicConsiderations: []
        };

        // Assess eligibility for cooperative programs
        Object.entries(this.cooperativePrograms).forEach(([key, program]) => {
            const eligibility = this.assessCooperativeEligibility(program, userProfile);
            const relevance = this.assessCooperativeRelevance(program, query);
            
            if (eligibility.eligible && relevance > 0.5) {
                opportunities.eligiblePrograms.push({
                    ...program,
                    eligibility,
                    relevance,
                    benefits: this.calculateCooperativeBenefits(program, userProfile),
                    considerations: this.getCooperativeConsiderations(program)
                });
            }
        });

        // Application processes
        opportunities.applicationProcesses = this.getCooperativeApplicationGuidance(opportunities.eligiblePrograms);

        // Benefit analysis
        opportunities.benefitAnalysis = this.analyzeCooperativeBenefits(opportunities.eligiblePrograms);

        return opportunities;
    }

    /**
 * Process user query and provide GovWin Customer Success guidance
 * Focus on understanding business intent and providing actionable search strategies
 */
async processQuery(query, context = {}) {
    const queryLower = query.toLowerCase();
    const userProfile = context.user || {};
    
    let response = {
        agentId: this.agentId,
        agentName: this.name,
        query,
        analysis: {},
        recommendations: [],
        resources: [],
        nextSteps: [],
        confidence: 0.85
    };

    try {
        // Parse user business intent from query
        const businessIntent = this.parseBusinessIntent(query);
        
        // Generate Customer Success response based on intent
        response.content = this.generateCustomerSuccessResponse(businessIntent, query);
        response.recommendations = this.generateGovWinActionSteps(businessIntent, query);
        response.nextSteps = this.generateGovWinNextSteps(businessIntent, query);
        response.resources = this.generateGovWinResources(businessIntent);
        
        return response;

    } catch (error) {
        console.error('SLED Markets Agent error:', error);
        return {
            ...response,
            error: true,
            content: 'I encountered an error helping you with your GovWin search. Please try rephrasing your question or contact support.',
            confidence: 0.1
        };
    }
}

/**
 * Parse business intent from user query
 */
parseBusinessIntent(query) {
    const intent = {
        type: 'general_guidance',
        sector: [],
        geography: [],
        keywords: [],
        needsHelp: 'navigation'
    };

    const queryLower = query.toLowerCase();

    // Identify sectors
    if (queryLower.includes('education') || queryLower.includes('school') || queryLower.includes('k-12') || queryLower.includes('university')) {
        intent.sector.push('education');
    }
    if (queryLower.includes('state') || queryLower.includes('government')) {
        intent.sector.push('state');
    }
    if (queryLower.includes('local') || queryLower.includes('city') || queryLower.includes('county') || queryLower.includes('municipal')) {
        intent.sector.push('local');
    }

    // Identify geography
    const states = ['california', 'texas', 'florida', 'new york', 'ohio', 'illinois', 'michigan', 'pennsylvania', 'north carolina', 'georgia'];
    states.forEach(state => {
        if (queryLower.includes(state)) {
            intent.geography.push(state);
        }
    });

    // Identify product/service keywords
    if (queryLower.includes('technology') || queryLower.includes('tech') || queryLower.includes('it')) {
        intent.keywords.push('technology', 'IT', 'tech');
    }
    if (queryLower.includes('procurement') || queryLower.includes('opportunities') || queryLower.includes('contracts')) {
        intent.keywords.push('procurement', 'contracting');
    }

    // Determine intent type
    if (queryLower.includes('find') || queryLower.includes('search') || queryLower.includes('opportunities')) {
        intent.type = 'find_opportunities';
    } else if (queryLower.includes('trends') || queryLower.includes('analysis') || queryLower.includes('market')) {
        intent.type = 'market_research';
    } else if (queryLower.includes('help') || queryLower.includes('how to')) {
        intent.type = 'navigation_help';
    }

    return intent;
}

/**
 * Generate Customer Success response focused on GovWin navigation
 */
generateCustomerSuccessResponse(businessIntent, originalQuery) {
    let response = `I understand you're looking to ${this.translateIntentToAction(businessIntent)} in GovWin. Let me help you navigate the platform to find exactly what you need.\n\n`;

    // Provide specific GovWin search strategy
    response += `**Here's your GovWin search strategy:**\n\n`;

    // Step 1: Access Advanced Search
    response += `1. **Start with Advanced Search**\n`;
    response += `   - Go to the main search bar in GovWin\n`;
    response += `   - Click "Advanced Search" for more filtering options\n\n`;

    // Step 2: Set sector filters
    if (businessIntent.sector.length > 0) {
        response += `2. **Set Sector Filters**\n`;
        businessIntent.sector.forEach(sector => {
            switch(sector) {
                case 'education':
                    response += `   - Select "Education" or "K-12" in the sector filter\n`;
                    response += `   - Consider also checking "Higher Education" if relevant\n`;
                    break;
                case 'state':
                    response += `   - Select "State Government" in the sector filter\n`;
                    break;
                case 'local':
                    response += `   - Select "Local Government" or "Municipal" in the sector filter\n`;
                    break;
            }
        });
        response += `\n`;
    }

    // Step 3: Set geographic filters
    if (businessIntent.geography.length > 0) {
        response += `3. **Set Geographic Filters**\n`;
        response += `   - Use the "Place of Performance" filter\n`;
        businessIntent.geography.forEach(state => {
            response += `   - Add "${state.charAt(0).toUpperCase() + state.slice(1)}" to your geographic search\n`;
        });
        response += `   - Consider setting up alerts for both states to monitor new opportunities\n\n`;
    }

    // Step 4: Use relevant keywords
    if (businessIntent.keywords.length > 0) {
        response += `4. **Use These Keywords**\n`;
        response += `   - In the keyword search field, try: "${businessIntent.keywords.join('", "')}"\n`;
        if (businessIntent.keywords.includes('technology')) {
            response += `   - Also try related terms: "EdTech", "computers", "software", "digital"\n`;
        }
        response += `\n`;
    }

    // Step 5: Filter by opportunity characteristics
    response += `5. **Filter by Opportunity Size & Type**\n`;
    response += `   - Set opportunity value ranges based on your company's capacity\n`;
    response += `   - Consider filtering by procurement stage (upcoming, active, awarded)\n`;
    response += `   - Look for opportunities that match your past performance capability\n\n`;

    return response;
}

/**
 * Generate actionable GovWin steps
 */
generateGovWinActionSteps(businessIntent, query) {
    const steps = [];

    if (businessIntent.type === 'find_opportunities') {
        steps.push("Execute the advanced search strategy I outlined above");
        steps.push("Save your search criteria as a 'Saved Search' for future monitoring");
        steps.push("Set up email alerts for new opportunities matching your criteria");
        steps.push("Review the opportunity details and procurement timeline for qualified matches");
    } else if (businessIntent.type === 'market_research') {
        steps.push("Use the search strategy to identify current opportunities in your target market");
        steps.push("Analyze the award history tab to understand competitive patterns");
        steps.push("Review contract values and award patterns over time");
        steps.push("Identify key decision makers and past winning vendors");
    }

    steps.push("Contact me if you need help refining your search or interpreting results");

    return steps;
}

/**
 * Generate specific next steps for GovWin success
 */
generateGovWinNextSteps(businessIntent, query) {
    const nextSteps = [
        "Execute the search strategy in GovWin using the filters I recommended",
        "Review 5-10 opportunities that match your criteria",
        "Set up automated email alerts for this search",
        "Analyze the competitive landscape from recent awards"
    ];

    if (businessIntent.geography.length > 0) {
        nextSteps.push(`Build relationships with procurement officials in ${businessIntent.geography.join(' and ')}`);
    }

    if (businessIntent.sector.includes('education')) {
        nextSteps.push("Research education procurement cycles and budget calendars");
        nextSteps.push("Consider attending education conferences and trade shows");
    }

    return nextSteps;
}

/**
 * Generate GovWin-specific resources
 */
generateGovWinResources(businessIntent) {
    const resources = [
        {
            title: 'GovWin Advanced Search Guide',
            description: 'Step-by-step guide to using advanced search filters effectively'
        },
        {
            title: 'Setting Up Opportunity Alerts',
            description: 'How to create automated alerts for new opportunities'
        },
        {
            title: 'Competitive Intelligence Dashboard',
            description: 'Using GovWin to analyze competitors and win patterns'
        }
    ];

    if (businessIntent.sector.includes('education')) {
        resources.push({
            title: 'Education Procurement Calendar',
            description: 'Understanding K-12 and higher education budget cycles'
        });
    }

    return resources;
}

/**
 * Translate business intent to user-friendly action
 */
translateIntentToAction(businessIntent) {
    if (businessIntent.type === 'find_opportunities') {
        return `find ${businessIntent.sector.join(' and ')} opportunities${businessIntent.geography.length > 0 ? ' in ' + businessIntent.geography.join(' and ') : ''}`;
    } else if (businessIntent.type === 'market_research') {
        return `research market trends and opportunities${businessIntent.geography.length > 0 ? ' in ' + businessIntent.geography.join(' and ') : ''}`;
    } else {
        return 'navigate GovWin to find the right opportunities for your business';
    }
}


    /**
     * Query classification methods
     */
    isStateProcurementQuery(query) {
        return /\bstate\b|state government|state contract|state procurement|state agency/i.test(query);
    }

    isMunicipalQuery(query) {
        return /municipal|city|county|town|village|local government|mayor|city council/i.test(query);
    }

    isEducationQuery(query) {
        return /education|school|k-?12|college|university|district|superintendent|higher ed/i.test(query);
    }

    isSLEDSearchQuery(query) {
        return /sled.*search|find.*opportunities|search.*local|municipal.*search|education.*opportunities/i.test(query);
    }

    isComplianceQuery(query) {
        return /compliance|certification|registration|license|permit|local.*requirement/i.test(query);
    }

    isRegionalAnalysisQuery(query) {
        return /regional|market analysis|northeast|southeast|midwest|west coast|region/i.test(query);
    }

    isCooperativeQuery(query) {
        return /cooperative|consortium|group purchasing|naspo|omnia|tips|sourcewell/i.test(query);
    }

    /**
     * Helper methods for analysis components
     */
    identifyStatesFromQuery(query) {
        const stateNames = Object.keys(this.stateProcurementSystems);
        return stateNames.filter(state => 
            query.toLowerCase().includes(state) || 
            query.toLowerCase().includes(this.stateProcurementSystems[state].name.toLowerCase())
        );
    }

    identifyCitySizeFromQuery(query) {
        if (/large|major|big|metro/i.test(query)) return 'major_cities';
        if (/small|town|rural/i.test(query)) return 'small_cities';
        return 'mid_size_cities';
    }

    identifyEducationSectorsFromQuery(query) {
        const sectors = [];
        if (/k-?12|school district|elementary|middle|high school/i.test(query)) {
            sectors.push('k12_districts');
        }
        if (/college|university|higher ed|campus/i.test(query)) {
            sectors.push('higher_education');
        }
        if (/community college|two.?year/i.test(query)) {
            sectors.push('community_colleges');
        }
        return sectors.length > 0 ? sectors : ['k12_districts', 'higher_education'];
    }

    identifyTargetMarketsFromQuery(query) {
        const markets = [];
        if (/state/i.test(query)) markets.push('state');
        if (/local|municipal|city|county/i.test(query)) markets.push('local');
        if (/education|school/i.test(query)) markets.push('education');
        return markets.length > 0 ? markets : ['state', 'local', 'education'];
    }

    identifyRegionsFromQuery(query) {
        const regions = [];
        Object.keys(this.regionalCharacteristics).forEach(region => {
            if (query.toLowerCase().includes(region)) {
                regions.push(region);
            }
        });
        return regions.length > 0 ? regions : ['southeast']; // Default region
    }

    /**
     * Generate response content
     */
    generateSLEDResponse(analysis, query) {
        let response = `Based on my SLED market expertise, here's my analysis of "${query}":\n\n`;

        if (analysis.stateProcurement) {
            response += `**State Procurement Analysis:**\n`;
            analysis.stateProcurement.targetStates.forEach(state => {
                response += `- ${state.name}: ${state.centralAgency} (Portal: ${state.procurementPortal})\n`;
            });
            response += `\n`;
        }

        if (analysis.municipal) {
            response += `**Municipal Procurement Guidance:**\n`;
            response += `Category: ${analysis.municipal.procurementStructure.category}\n`;
            response += `Typical thresholds: ${JSON.stringify(analysis.municipal.procurementStructure.thresholds)}\n\n`;
        }

        if (analysis.education) {
            response += `**Education Sector Opportunities:**\n`;
            analysis.education.applicableSectors.forEach(sector => {
                response += `- ${sector.name}: ${sector.governance}\n`;
            });
            response += `\n`;
        }

        return response;
    }

    generateSLEDResources(analysis) {
        const resources = [
            {
                title: 'NASPO ValuePoint - State Cooperative Contracts',
                url: 'https://www.naspovaluepoint.org',
                description: 'National cooperative purchasing program for state and local governments'
            },
            {
                title: 'OMNIA Partners - Public Procurement Cooperative',
                url: 'https://www.omniapartners.com',
                description: 'Largest purchasing cooperative serving public agencies'
            },
            {
                title: 'National Institute of Governmental Purchasing (NIGP)',
                url: 'https://www.nigp.org',
                description: 'Professional development and resources for government procurement'
            }
        ];

        return resources;
    }

    generateSLEDNextSteps(analysis, userProfile) {
        const steps = [
            'Identify target SLED markets based on your capabilities',
            'Register with relevant state procurement systems',
            'Research local certification programs and preferences',
            'Build relationships with procurement officials',
            'Monitor cooperative purchasing opportunities'
        ];

        return steps;
    }

    // Placeholder methods for recommendation generation
    generateStateProcurementRecommendations(analysis) { return []; }
    generateMunicipalRecommendations(analysis) { return []; }
    generateEducationRecommendations(analysis) { return []; }
    generateSearchRecommendations(analysis) { return []; }
    generateComplianceRecommendations(analysis) { return []; }
    generateRegionalRecommendations(analysis) { return []; }
    generateCooperativeRecommendations(analysis) { return []; }

    // Additional helper methods (simplified for space)
    assessStateOpportunities(stateInfo, query, userProfile) { return []; }
    identifyStateBarriers(stateInfo, userProfile) { return []; }
    generateStateStrategy(stateInfo, query) { return {}; }
    analyzeGeneralStateRequirements(query) { return []; }
    assessRegistrationRequirements(states) { return []; }
    identifyStateOpportunityTypes(query, userProfile) { return []; }
    getMunicipalProcessRequirements(type, query) { return []; }
    generateThresholdGuidance(type) { return {}; }
    analyzeLocalPreferences(query, userProfile) { return []; }
    generateRelationshipStrategy(type) { return {}; }
    getMunicipalCompliance(type) { return []; }

    generateGeneralSLEDGuidance(query, userProfile) {
        return {
            agentId: this.agentId,
            agentName: this.name,
            query,
            content: `For SLED market guidance on "${query}", I recommend focusing on understanding the unique characteristics of state, local, and education procurement. Each segment has distinct processes, relationships, and opportunities. Start by identifying your target markets and building local relationships.`,
            recommendations: [
                'Research target SLED markets thoroughly',
                'Understand local procurement processes and thresholds',
                'Build relationships with procurement officials',
                'Consider cooperative purchasing opportunities',
                'Obtain relevant local certifications'
            ],
            resources: this.generateSLEDResources({}),
            nextSteps: this.generateSLEDNextSteps({}, userProfile),
            confidence: 0.7
        };
    }
}

module.exports = SLEDMarketsAgent;