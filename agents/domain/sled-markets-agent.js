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
     * Process user query and provide specialized SLED guidance
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
            // Route to appropriate analysis based on query content
            if (this.isStateProcurementQuery(queryLower)) {
                response.analysis.stateProcurement = this.analyzeStateProcurement(query, [], userProfile);
                response.recommendations.push(...this.generateStateProcurementRecommendations(response.analysis.stateProcurement));
            }

            if (this.isMunicipalQuery(queryLower)) {
                const citySize = this.identifyCitySizeFromQuery(queryLower);
                response.analysis.municipal = this.analyzeMunicipalProcurement(query, citySize, userProfile);
                response.recommendations.push(...this.generateMunicipalRecommendations(response.analysis.municipal));
            }

            if (this.isEducationQuery(queryLower)) {
                response.analysis.education = this.analyzeEducationSector(query, null, userProfile);
                response.recommendations.push(...this.generateEducationRecommendations(response.analysis.education));
            }

            if (this.isSLEDSearchQuery(queryLower)) {
                const targetMarkets = this.identifyTargetMarketsFromQuery(queryLower);
                response.analysis.searchOptimization = this.optimizeSLEDSearch({ query, userProfile }, targetMarkets);
                response.recommendations.push(...this.generateSearchRecommendations(response.analysis.searchOptimization));
            }

            if (this.isComplianceQuery(queryLower)) {
                response.analysis.compliance = this.assessLocalCompliance(query, 'general', userProfile);
                response.recommendations.push(...this.generateComplianceRecommendations(response.analysis.compliance));
            }

            if (this.isRegionalAnalysisQuery(queryLower)) {
                response.analysis.regionalMarket = this.analyzeRegionalMarket(query, null, userProfile);
                response.recommendations.push(...this.generateRegionalRecommendations(response.analysis.regionalMarket));
            }

            if (this.isCooperativeQuery(queryLower)) {
                response.analysis.cooperative = this.identifyCooperativeOpportunities(query, userProfile);
                response.recommendations.push(...this.generateCooperativeRecommendations(response.analysis.cooperative));
            }

            // Generate comprehensive response
            response.content = this.generateSLEDResponse(response.analysis, query);
            response.resources = this.generateSLEDResources(response.analysis);
            response.nextSteps = this.generateSLEDNextSteps(response.analysis, userProfile);

            // If no specific analysis matched, provide general SLED guidance
            if (Object.keys(response.analysis).length === 0) {
                response = this.generateGeneralSLEDGuidance(query, userProfile);
            }

            return response;

        } catch (error) {
            console.error('SLED Markets Agent error:', error);
            return {
                ...response,
                error: true,
                content: 'I encountered an error analyzing your SLED market query. Please try rephrasing your question or contact support.',
                confidence: 0.1
            };
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