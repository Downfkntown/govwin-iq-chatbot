/**
 * Regional and Local Markets Agent
 * 
 * Context-driven agent for US SLED and Canadian MASH markets with expertise in:
 * 
 * US SLED Markets (State, Local, Education, District):
 * - State government procurement processes and regulations
 * - Local government contracting (municipal, county, city)
 * - Education sector procurement (K-12, higher education)
 * - Special district procurement (utilities, transportation, healthcare)
 * - Cooperative purchasing programs and consortiums
 * 
 * Canadian MASH Markets (Municipal, Academic, Social Services, Healthcare):
 * - Municipal government procurement across provinces
 * - Academic institution contracting (universities, colleges, school boards)
 * - Social services and non-profit sector procurement
 * - Healthcare system procurement (provincial health authorities)
 * - Provincial and territorial government contracting
 * 
 * Context-Driven Features:
 * - Market-specific responses based on user query context
 * - Cross-market comparison only when explicitly requested
 * - Regional expertise for procurement regulations and processes
 */

class RegionalLocalMarketsAgent {
    constructor() {
        this.agentId = 'regional-local-markets';
        this.name = 'Regional and Local Markets Specialist';
        this.version = '1.0.0';
        
        this.expertise = [
            'us_sled_markets',
            'canadian_mash_markets',
            'state_government_procurement',
            'local_government_contracting',
            'education_sector_procurement',
            'municipal_government_procurement',
            'healthcare_procurement',
            'cooperative_purchasing',
            'regional_compliance_requirements'
        ];
        
        this.capabilities = [
            'state_procurement_analysis',
            'local_government_guidance',
            'education_market_assessment',
            'municipal_contracting_support',
            'healthcare_procurement_guidance',
            'cooperative_purchasing_optimization',
            'regional_market_comparison',
            'compliance_requirement_analysis',
            'opportunity_identification',
            'vendor_registration_guidance'
        ];
        
        this.supportedMarkets = ['us_sled', 'canada_mash', 'cross_regional'];
        
        this.initializeKnowledgeBases();
    }

    /**
     * Initialize regional and local market knowledge bases
     */
    initializeKnowledgeBases() {
        this.initializeUSSLEDData();
        this.initializeCanadianMASHData();
        this.initializeCrossRegionalData();
    }

    /**
     * Initialize US SLED market data
     */
    initializeUSSLEDData() {
        // US State Government Procurement
        this.usStateGovernments = {
            'california': {
                name: 'California',
                population: '39.5M',
                procurementPortal: 'Cal eProcure',
                url: 'https://caleprocure.ca.gov',
                keyFeatures: ['DVBE program', 'Small Business preferences', 'Environmental requirements'],
                thresholds: {
                    smallPurchase: '$5,000',
                    formalBid: '$100,000',
                    advertisement: '$25,000'
                },
                diversityPrograms: ['DVBE', 'Small Business', 'Microbusiness'],
                commonNAICS: ['541511', '541330', '541611', '541990']
            },
            'texas': {
                name: 'Texas',
                population: '30.0M',
                procurementPortal: 'Texas SmartBuy',
                url: 'https://txsmartbuy.com',
                keyFeatures: ['HUB program', 'Local preferences', 'Cooperative contracts'],
                thresholds: {
                    smallPurchase: '$10,000',
                    formalBid: '$50,000',
                    advertisement: '$25,000'
                },
                diversityPrograms: ['HUB (Historically Underutilized Business)', 'Small Business'],
                commonNAICS: ['541511', '541330', '541611', '541990']
            },
            'florida': {
                name: 'Florida',
                population: '22.6M',
                procurementPortal: 'MyFloridaMarketPlace',
                url: 'https://myfloridamarketplace.com',
                keyFeatures: ['Vendor Information Portal', 'State term contracts', 'Local preference'],
                thresholds: {
                    smallPurchase: '$7,500',
                    formalBid: '$50,000',
                    advertisement: '$35,000'
                },
                diversityPrograms: ['Small Business', 'Minority Business Enterprise'],
                commonNAICS: ['541511', '541330', '541611', '541990']
            }
        };

        // US Local Government Types
        this.usLocalGovernments = {
            'county': {
                description: 'County-level government procurement',
                characteristics: ['Larger budgets', 'Formal procurement processes', 'Professional procurement staff'],
                commonServices: ['IT services', 'Public safety', 'Infrastructure', 'Social services'],
                procurementMethods: ['RFP', 'IFB', 'RFQ', 'Sole source'],
                averageContractSize: '$50K - $5M',
                decisionTimeline: '3-6 months',
                keyConsiderations: ['Local preferences', 'Public meetings', 'Protest procedures']
            },
            'city': {
                description: 'Municipal city government procurement',
                characteristics: ['Varied sizes', 'Local preferences', 'Community focus'],
                commonServices: ['Public works', 'IT services', 'Professional services', 'Equipment'],
                procurementMethods: ['RFP', 'Quotes', 'Cooperative purchasing'],
                averageContractSize: '$25K - $2M',
                decisionTimeline: '2-4 months',
                keyConsiderations: ['Local business preferences', 'City council approval', 'Public input']
            },
            'school_district': {
                description: 'K-12 education district procurement',
                characteristics: ['Education focus', 'Limited budgets', 'Seasonal cycles'],
                commonServices: ['Educational technology', 'Transportation', 'Food services', 'Facilities'],
                procurementMethods: ['RFP', 'Cooperative purchasing', 'State contracts'],
                averageContractSize: '$10K - $1M',
                decisionTimeline: '2-6 months',
                keyConsiderations: ['Educational outcomes', 'Budget constraints', 'Parent community input']
            }
        };

        // US Education Sector
        this.usEducationSector = {
            'k12_districts': {
                segment: 'K-12 School Districts',
                marketSize: '$765 billion annually',
                keyDrivers: ['Technology integration', 'Infrastructure modernization', 'Safety and security'],
                procurementCycles: {
                    'budget_planning': 'January - March',
                    'procurement_season': 'April - August',
                    'implementation': 'September - December'
                },
                commonProcurement: ['Educational technology', 'Textbooks', 'Transportation', 'Food services', 'Facilities'],
                cooperativePrograms: ['E&I Cooperative', 'OMNIA Partners', 'PEPPM', 'TIPS'],
                compliance: ['FERPA', 'CIPA', 'Section 508', 'IDEA']
            },
            'higher_education': {
                segment: 'Colleges and Universities',
                marketSize: '$750 billion annually',
                keyDrivers: ['Research infrastructure', 'Campus modernization', 'Digital transformation'],
                procurementCycles: {
                    'fiscal_year': 'July 1 - June 30',
                    'budget_approval': 'April - June',
                    'procurement_peak': 'August - November'
                },
                commonProcurement: ['Research equipment', 'IT infrastructure', 'Professional services', 'Construction'],
                cooperativePrograms: ['Internet2', 'EDUCAUSE', 'Regional consortiums'],
                compliance: ['Title IX', 'Research regulations', 'Accessibility requirements']
            }
        };

        // US Cooperative Purchasing Programs
        this.usCooperativePrograms = {
            'naspo': {
                name: 'NASPO ValuePoint',
                description: 'National Association of State Procurement Officials cooperative contracts',
                coverage: 'All 50 states',
                categories: ['IT', 'Vehicles', 'Office supplies', 'Professional services'],
                benefits: ['Pre-competed contracts', 'Volume pricing', 'Reduced procurement time'],
                participation: 'State and local governments, nonprofits, education'
            },
            'omnia_partners': {
                name: 'OMNIA Partners',
                description: 'Nation\'s largest public sector cooperative purchasing organization',
                coverage: 'National',
                categories: ['Facilities', 'IT', 'Fleet', 'Public safety'],
                benefits: ['Streamlined procurement', 'Best practices', 'Contract compliance'],
                participation: 'Government, education, nonprofits'
            },
            'tips': {
                name: 'TIPS (The Interlocal Purchasing System)',
                description: 'Texas-based cooperative purchasing program',
                coverage: 'National with Texas focus',
                categories: ['Construction', 'Technology', 'Equipment', 'Services'],
                benefits: ['Competitive pricing', 'Local participation', 'Compliance support'],
                participation: 'Public entities, nonprofits'
            }
        };

        // US SLED Procurement Regulations
        this.usSLEDRegulations = {
            'transparency_requirements': {
                description: 'Public transparency and open records requirements',
                requirements: [
                    'Public posting of solicitations',
                    'Open bid openings',
                    'Public records access',
                    'Ethics and conflict of interest rules'
                ],
                implications: ['Documentation requirements', 'Public scrutiny', 'Process transparency']
            },
            'local_preferences': {
                description: 'Local and regional business preferences',
                types: ['Geographic preferences', 'Small business set-asides', 'Local content requirements'],
                considerations: ['Preference percentages', 'Qualification criteria', 'Documentation needs']
            },
            'prevailing_wage': {
                description: 'Prevailing wage requirements for government contracts',
                applicability: 'Construction and service contracts over specified thresholds',
                compliance: ['Wage determinations', 'Certified payroll', 'Worker classifications']
            }
        };
    }

    /**
     * Initialize Canadian MASH market data
     */
    initializeCanadianMASHData() {
        // Canadian Provincial Governments
        this.canadianProvinces = {
            'ontario': {
                name: 'Ontario',
                population: '15.0M',
                procurementEntity: 'Infrastructure Ontario',
                procurementPortal: 'MERX',
                url: 'https://merx.com',
                keyFeatures: ['Ontario Business Registry', 'Indigenous procurement', 'Green procurement'],
                thresholds: {
                    publicTender: '$100,000',
                    advertisement: '$25,000',
                    tradeAgreement: '$267,000'
                },
                diversityPrograms: ['Indigenous procurement', 'Social procurement'],
                commonSectors: ['Healthcare', 'Education', 'Infrastructure', 'Technology']
            },
            'quebec': {
                name: 'Quebec',
                population: '8.6M',
                procurementEntity: 'Secrétariat du Conseil du trésor',
                procurementPortal: 'SEAO',
                url: 'https://seao.ca',
                keyFeatures: ['French language requirements', 'Quebec business preference', 'Environmental criteria'],
                thresholds: {
                    publicTender: '$100,000',
                    advertisement: '$25,000',
                    tradeAgreement: '$267,000'
                },
                diversityPrograms: ['Quebec business priority', 'Social economy enterprises'],
                commonSectors: ['Healthcare', 'Education', 'Infrastructure', 'Culture']
            },
            'british_columbia': {
                name: 'British Columbia',
                population: '5.2M',
                procurementEntity: 'BC Bid',
                procurementPortal: 'BC Bid',
                url: 'https://bcbid.gov.bc.ca',
                keyFeatures: ['Indigenous procurement', 'Social procurement', 'Environmental standards'],
                thresholds: {
                    publicTender: '$75,000',
                    advertisement: '$10,000',
                    tradeAgreement: '$267,000'
                },
                diversityPrograms: ['Indigenous procurement', 'Social enterprises', 'Community benefits'],
                commonSectors: ['Natural resources', 'Technology', 'Healthcare', 'Education']
            }
        };

        // Canadian Municipal Governments
        this.canadianMunicipalities = {
            'major_cities': {
                description: 'Large metropolitan municipal governments',
                examples: ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Ottawa'],
                characteristics: ['Formal procurement processes', 'Professional staff', 'Diverse requirements'],
                commonServices: ['Infrastructure', 'IT services', 'Professional services', 'Equipment'],
                procurementMethods: ['RFP', 'RFQ', 'Tender', 'Cooperative purchasing'],
                averageContractSize: '$50K - $10M',
                keyConsiderations: ['Municipal policies', 'Council approval', 'Public accountability']
            },
            'regional_municipalities': {
                description: 'Regional government entities',
                examples: ['Region of Peel', 'York Region', 'Regional Municipality of Niagara'],
                characteristics: ['Shared services', 'Larger scale projects', 'Inter-municipal cooperation'],
                commonServices: ['Water/wastewater', 'Transportation', 'Waste management', 'Emergency services'],
                procurementMethods: ['Public tender', 'RFP', 'Prequalification'],
                averageContractSize: '$100K - $20M',
                keyConsiderations: ['Regional policies', 'Multi-jurisdictional coordination']
            }
        };

        // Canadian Academic Sector
        this.canadianAcademicSector = {
            'universities': {
                segment: 'Universities and Colleges',
                governance: 'Provincial jurisdiction with federal research funding',
                keyInstitutions: ['University of Toronto', 'McGill University', 'UBC', 'University of Alberta'],
                procurementFocus: ['Research equipment', 'IT infrastructure', 'Campus services', 'Construction'],
                fundingSources: ['Provincial grants', 'Federal research funding', 'Tuition', 'Donations'],
                cooperativePrograms: ['CAUBO (Canadian Association of University Business Officers)', 'Regional consortiums'],
                compliance: ['Provincial regulations', 'Trade agreements', 'Research ethics']
            },
            'school_boards': {
                segment: 'Public School Boards',
                governance: 'Provincial/territorial jurisdiction',
                characteristics: ['Public education mandate', 'Limited budgets', 'Community accountability'],
                procurementFocus: ['Educational technology', 'Transportation', 'Facilities', 'Professional services'],
                cooperativePrograms: ['Provincial cooperatives', 'Regional partnerships'],
                compliance: ['Provincial education acts', 'Accessibility requirements', 'Safety standards']
            }
        };

        // Canadian Healthcare Sector
        this.canadianHealthcareSector = {
            'provincial_health_authorities': {
                segment: 'Provincial Health Authorities',
                description: 'Regional healthcare delivery organizations',
                examples: ['Ontario Health', 'Alberta Health Services', 'Fraser Health', 'CISSS/CIUSSS (Quebec)'],
                procurementFocus: ['Medical equipment', 'IT systems', 'Professional services', 'Pharmaceuticals'],
                budgetSources: ['Provincial health budgets', 'Federal transfers', 'Specialized funding'],
                procurementMethods: ['Public tender', 'RFP', 'Group purchasing organizations'],
                compliance: ['Health regulations', 'Privacy laws', 'Safety standards']
            },
            'group_purchasing': {
                segment: 'Healthcare Group Purchasing Organizations',
                description: 'Cooperative purchasing entities for healthcare',
                examples: ['HealthPRO', 'Mohawk Medbuy', 'Shared Health Manitoba'],
                benefits: ['Volume pricing', 'Standardization', 'Reduced administrative burden'],
                categories: ['Medical supplies', 'Equipment', 'IT systems', 'Professional services']
            }
        };

        // Canadian Social Services Sector
        this.canadianSocialServices = {
            'non_profit_organizations': {
                segment: 'Non-Profit and Social Service Organizations',
                fundingSources: ['Government grants', 'Donations', 'Fee-for-service contracts'],
                procurementNeeds: ['IT services', 'Professional services', 'Program delivery', 'Facilities'],
                considerations: ['Limited budgets', 'Mission alignment', 'Accountability requirements'],
                opportunities: ['Service delivery contracts', 'Capacity building', 'Technology solutions']
            },
            'indigenous_organizations': {
                segment: 'Indigenous Organizations and Governments',
                governance: 'Band councils, tribal councils, Métis organizations',
                fundingSources: ['Federal Indigenous Services Canada', 'Own-source revenue', 'Partnerships'],
                procurementFocus: ['Infrastructure', 'Education', 'Healthcare', 'Economic development'],
                considerations: ['Cultural sensitivity', 'Community benefits', 'Capacity building'],
                opportunities: ['Infrastructure development', 'Capacity building', 'Cultural programs']
            }
        };
    }

    /**
     * Initialize cross-regional comparison data
     */
    initializeCrossRegionalData() {
        this.regionalComparisons = {
            'market_characteristics': {
                us_sled: {
                    marketSize: '$1.8 trillion annually',
                    competitionLevel: 'High to Moderate',
                    procurementComplexity: 'Varies by jurisdiction',
                    advantages: ['Large market size', 'Diverse opportunities', 'Established processes']
                },
                canada_mash: {
                    marketSize: '$250 billion annually',
                    competitionLevel: 'Moderate',
                    procurementComplexity: 'Provincial variations',
                    advantages: ['Less competition', 'Relationship-focused', 'Social procurement opportunities']
                }
            },
            'procurement_thresholds': {
                us_sled: 'Varies by state/locality ($5K-$100K typical)',
                canada_mash: 'Provincial standards ($10K-$100K typical)'
            },
            'business_preferences': {
                us_sled: ['Local businesses', 'Small businesses', 'Minority-owned businesses', 'Veteran-owned businesses'],
                canada_mash: ['Indigenous businesses', 'Local businesses', 'Social enterprises', 'Quebec businesses (in Quebec)']
            },
            'key_compliance_areas': {
                us_sled: ['Prevailing wage', 'Local preferences', 'Transparency requirements', 'Ethics rules'],
                canada_mash: ['Trade agreements', 'Language requirements', 'Indigenous procurement', 'Environmental standards']
            }
        };

        this.crossRegionalOpportunities = {
            'market_entry_strategies': {
                'direct_registration': {
                    description: 'Direct registration with target jurisdictions',
                    suitability: 'Companies with resources for multi-jurisdictional compliance',
                    timeline: '3-6 months per jurisdiction',
                    investment: 'Medium to High'
                },
                'regional_partnerships': {
                    description: 'Partner with local firms in target regions',
                    suitability: 'Companies seeking market knowledge and relationships',
                    timeline: '2-4 months',
                    investment: 'Low to Medium'
                },
                'cooperative_contracts': {
                    description: 'Leverage cooperative purchasing programs',
                    suitability: 'Companies with standardized offerings',
                    timeline: '6-12 months',
                    investment: 'Medium'
                }
            }
        };
    }

    /**
     * Determine target market from query and context
     */
    determineTargetMarket(queryLower, context = {}) {
        // Cross-market indicators (check first - highest priority)
        if (this.isExplicitCrossMarketRequest(queryLower)) {
            return 'both';
        }
        
        // US SLED market indicators
        if (/\b(?:state|local|education|school|district|k.?12|university|college|municipal|county|city)\b.*(?:us|usa|united states|american)/i.test(queryLower) ||
            /\b(?:us|usa|united states|american)\b.*(?:state|local|education|school|district|k.?12|university|college|municipal|county|city)/i.test(queryLower) ||
            /\b(?:sled|naspo|omnia|tips|cooperative purchasing|state government|local government)\b/i.test(queryLower) ||
            /\b(?:california|texas|florida|new york|illinois)\b.*(?:procurement|contract|bid)/i.test(queryLower)) {
            return 'us_sled';
        }
        
        // Canadian MASH market indicators  
        if (/\b(?:municipal|academic|social|healthcare|provincial|territorial)\b.*(?:canada|canadian)\b/i.test(queryLower) ||
            /\b(?:canada|canadian)\b.*(?:municipal|academic|social|healthcare|provincial|territorial)/i.test(queryLower) ||
            /\b(?:mash|merx|seao|bc bid|ontario health|health authority)\b/i.test(queryLower) ||
            /\b(?:toronto|montreal|vancouver|calgary|ottawa|edmonton|winnipeg)\b.*(?:municipal|procurement|contract)/i.test(queryLower) ||
            /\b(?:ontario|quebec|british columbia|alberta|manitoba|saskatchewan)\b.*(?:municipal|procurement|health|academic)/i.test(queryLower) ||
            /\b(?:indigenous.*procurement|social.*procurement|university.*canada|college.*canada|school.*board.*canada)\b/i.test(queryLower)) {
            return 'canada_mash';
        }

        // General indicators that could apply to either market
        if (/\b(?:canada|canadian|\.ca)\b/i.test(queryLower)) {
            return 'canada_mash';
        }
        
        if (/\b(?:us|usa|united states|american|state|local|education)\b/i.test(queryLower)) {
            return 'us_sled';
        }

        // Context-based determination
        if (context.user?.location?.country) {
            return context.user.location.country.toLowerCase() === 'canada' ? 'canada_mash' : 'us_sled';
        }
        
        // Default to US SLED (larger market) when no clear indicators
        return 'us_sled';
    }
    
    /**
     * Check if query explicitly requests cross-market comparison
     */
    isExplicitCrossMarketRequest(queryLower) {
        return /compare.*markets|cross.?border|both.*markets|us.*(?:vs|versus|compared to).*canada|canada.*(?:vs|versus|compared to).*us|sled.*vs.*mash|mash.*vs.*sled|north.*american.*comparison|difference.*between.*(?:us.*canada|sled.*mash)/i.test(queryLower);
    }

    /**
     * Process user query with market awareness
     */
    async processQuery(query, context = {}) {
        const queryLower = query.toLowerCase();
        const userProfile = context.user || {};
        
        // Determine target market from query or context
        const targetMarket = this.determineTargetMarket(queryLower, context);
        
        let response = {
            agentId: this.agentId,
            agentName: this.name,
            query,
            targetMarket,
            analysis: {},
            recommendations: [],
            resources: [],
            nextSteps: [],
            confidence: 0.85
        };

        try {
            // Route to appropriate analysis based on query content and market
            if (this.isStateGovernmentQuery(queryLower) && (targetMarket === 'us_sled' || targetMarket === 'both')) {
                response.analysis.stateGov = this.analyzeStateGovernment(query, userProfile);
                response.recommendations.push(...this.generateStateGovRecommendations(response.analysis.stateGov));
            }

            if (this.isLocalGovernmentQuery(queryLower) && (targetMarket === 'us_sled' || targetMarket === 'both')) {
                response.analysis.localGov = this.analyzeLocalGovernment(query, userProfile);
                response.recommendations.push(...this.generateLocalGovRecommendations(response.analysis.localGov));
            }

            if (this.isEducationQuery(queryLower) && (targetMarket === 'us_sled' || targetMarket === 'both')) {
                response.analysis.education = this.analyzeEducationSector(query, userProfile);
                response.recommendations.push(...this.generateEducationRecommendations(response.analysis.education));
            }

            if (this.isMunicipalQuery(queryLower) && (targetMarket === 'canada_mash' || targetMarket === 'both')) {
                response.analysis.municipal = this.analyzeMunicipalGovernment(query, userProfile);
                response.recommendations.push(...this.generateMunicipalRecommendations(response.analysis.municipal));
            }

            if (this.isAcademicQuery(queryLower) && (targetMarket === 'canada_mash' || targetMarket === 'both')) {
                response.analysis.academic = this.analyzeAcademicSector(query, userProfile);
                response.recommendations.push(...this.generateAcademicRecommendations(response.analysis.academic));
            }

            if (this.isHealthcareQuery(queryLower) && (targetMarket === 'canada_mash' || targetMarket === 'both')) {
                response.analysis.healthcare = this.analyzeHealthcareSector(query, userProfile);
                response.recommendations.push(...this.generateHealthcareRecommendations(response.analysis.healthcare));
            }

            if (this.isCooperativePurchasingQuery(queryLower)) {
                response.analysis.cooperative = this.analyzeCooperativePurchasing(query, userProfile, targetMarket);
                response.recommendations.push(...this.generateCooperativeRecommendations(response.analysis.cooperative));
            }

            // Only perform cross-regional analysis when explicitly requested
            if (this.isExplicitCrossMarketRequest(queryLower) || targetMarket === 'both') {
                response.analysis.crossRegional = this.performCrossRegionalComparison(query, userProfile);
                response.recommendations.push(...this.generateCrossRegionalRecommendations(response.analysis.crossRegional));
            }

            // Generate comprehensive response
            response.content = this.generateRegionalResponse(response.analysis, query, targetMarket);
            response.resources = this.generateRegionalResources(response.analysis, targetMarket);
            response.nextSteps = this.generateRegionalNextSteps(response.analysis, userProfile, targetMarket);

            // If no specific analysis matched, provide general guidance
            if (Object.keys(response.analysis).length === 0) {
                response = this.generateGeneralRegionalGuidance(query, userProfile, targetMarket);
            }

            return response;

        } catch (error) {
            console.error('Regional Local Markets Agent error:', error);
            return {
                ...response,
                error: true,
                content: 'I encountered an error analyzing your regional/local markets query. Please try rephrasing your question or contact support.',
                confidence: 0.1
            };
        }
    }

    /**
     * Query classification methods for different market segments
     */
    isStateGovernmentQuery(query) {
        return /state.*government|state.*procurement|state.*contract|governor.*office|state.*agency|state.*rfp/i.test(query);
    }

    isLocalGovernmentQuery(query) {
        return /local.*government|city.*government|county.*government|municipal.*contract|local.*procurement|city.*council/i.test(query);
    }

    isEducationQuery(query) {
        return /school.*district|k.?12|education.*procurement|university|college|academic.*institution|educational.*technology/i.test(query);
    }

    isMunicipalQuery(query) {
        return /municipal.*government|city.*canada|regional.*municipality|municipal.*procurement|mayor.*office/i.test(query);
    }

    isAcademicQuery(query) {
        return /university.*canada|canadian.*university|school.*board.*canada|academic.*procurement.*canada|college.*canada/i.test(query);
    }

    isHealthcareQuery(query) {
        return /health.*authority|healthcare.*procurement|hospital.*contract|medical.*equipment|health.*canada/i.test(query);
    }

    isSocialServicesQuery(query) {
        return /social.*services|non.*profit|indigenous.*organization|community.*services|social.*procurement/i.test(query);
    }

    isCooperativePurchasingQuery(query) {
        return /cooperative.*purchasing|group.*purchasing|consortium|shared.*services|bulk.*purchasing|naspo|omnia/i.test(query);
    }

    /**
     * Analysis methods for different market segments
     */
    analyzeStateGovernment(query, userProfile = {}) {
        const analysis = {
            relevantStates: [],
            procurementMethods: [],
            opportunities: [],
            complianceRequirements: []
        };

        // Identify relevant states based on query
        Object.entries(this.usStateGovernments).forEach(([key, state]) => {
            if (query.toLowerCase().includes(state.name.toLowerCase())) {
                analysis.relevantStates.push({
                    key,
                    ...state,
                    opportunity: this.assessStateOpportunity(state, userProfile)
                });
            }
        });

        // If no specific states mentioned, provide general guidance
        if (analysis.relevantStates.length === 0) {
            analysis.relevantStates = Object.entries(this.usStateGovernments).slice(0, 3).map(([key, state]) => ({
                key,
                ...state,
                opportunity: this.assessStateOpportunity(state, userProfile)
            }));
        }

        return analysis;
    }

    analyzeLocalGovernment(query, userProfile = {}) {
        const analysis = {
            governmentTypes: [],
            procurementConsiderations: [],
            opportunities: []
        };

        // Identify relevant local government types
        Object.entries(this.usLocalGovernments).forEach(([key, govType]) => {
            const keywords = govType.description.toLowerCase().split(' ');
            if (keywords.some(keyword => query.toLowerCase().includes(keyword))) {
                analysis.governmentTypes.push({
                    type: key,
                    ...govType,
                    suitability: this.assessLocalGovSuitability(govType, userProfile)
                });
            }
        });

        return analysis;
    }

    analyzeEducationSector(query, userProfile = {}) {
        const analysis = {
            segments: [],
            seasonalConsiderations: {},
            cooperativeOpportunities: []
        };

        // Analyze education segments
        Object.entries(this.usEducationSector).forEach(([key, segment]) => {
            if (query.toLowerCase().includes(key.replace('_', ' ')) || 
                segment.segment.toLowerCase().split(' ').some(word => query.toLowerCase().includes(word))) {
                analysis.segments.push({
                    segmentKey: key,
                    ...segment,
                    marketFit: this.assessEducationMarketFit(segment, userProfile)
                });
            }
        });

        return analysis;
    }

    analyzeMunicipalGovernment(query, userProfile = {}) {
        const analysis = {
            municipalTypes: [],
            provinces: [],
            opportunities: []
        };

        // Identify relevant municipal types and provinces
        Object.entries(this.canadianMunicipalities).forEach(([key, municipal]) => {
            if (municipal.description.toLowerCase().split(' ').some(word => query.toLowerCase().includes(word))) {
                analysis.municipalTypes.push({
                    type: key,
                    ...municipal,
                    opportunity: this.assessMunicipalOpportunity(municipal, userProfile)
                });
            }
        });

        return analysis;
    }

    analyzeAcademicSector(query, userProfile = {}) {
        const analysis = {
            academicSegments: [],
            fundingConsiderations: [],
            cooperativeOpportunities: []
        };

        Object.entries(this.canadianAcademicSector).forEach(([key, segment]) => {
            if (segment.segment.toLowerCase().split(' ').some(word => query.toLowerCase().includes(word))) {
                analysis.academicSegments.push({
                    segmentKey: key,
                    ...segment,
                    marketFit: this.assessAcademicMarketFit(segment, userProfile)
                });
            }
        });

        return analysis;
    }

    analyzeHealthcareSector(query, userProfile = {}) {
        const analysis = {
            healthcareSegments: [],
            procurementMethods: [],
            groupPurchasingOpportunities: []
        };

        if (this.canadianHealthcareSector) {
            Object.entries(this.canadianHealthcareSector).forEach(([key, segment]) => {
                if (segment.segment.toLowerCase().split(' ').some(word => query.toLowerCase().includes(word))) {
                    analysis.healthcareSegments.push({
                        segmentKey: key,
                        ...segment,
                        marketFit: this.assessHealthcareMarketFit(segment, userProfile)
                    });
                }
            });
        }

        return analysis;
    }

    analyzeCooperativePurchasing(query, userProfile = {}, targetMarket) {
        const analysis = {
            relevantPrograms: [],
            benefits: [],
            participationRequirements: []
        };

        if (targetMarket === 'us_sled' || targetMarket === 'both') {
            Object.entries(this.usCooperativePrograms).forEach(([key, program]) => {
                if (query.toLowerCase().includes(program.name.toLowerCase()) || 
                    program.categories.some(cat => query.toLowerCase().includes(cat.toLowerCase()))) {
                    analysis.relevantPrograms.push({
                        programKey: key,
                        market: 'us_sled',
                        ...program,
                        suitability: this.assessCooperativeSuitability(program, userProfile)
                    });
                }
            });
        }

        return analysis;
    }

    /**
     * Cross-regional comparison analysis
     */
    performCrossRegionalComparison(query, userProfile = {}) {
        const comparison = {
            marketOverview: this.regionalComparisons.market_characteristics,
            procurementDifferences: {},
            opportunityComparison: {},
            entryStrategies: this.crossRegionalOpportunities.market_entry_strategies,
            recommendations: []
        };

        // Compare procurement approaches
        comparison.procurementDifferences = {
            thresholds: this.regionalComparisons.procurement_thresholds,
            preferences: this.regionalComparisons.business_preferences,
            compliance: this.regionalComparisons.key_compliance_areas
        };

        // Generate strategic recommendations
        comparison.recommendations = this.generateCrossRegionalStrategicRecommendations(comparison);

        return comparison;
    }

    /**
     * Response generation methods
     */
    generateRegionalResponse(analysis, query, targetMarket) {
        let response = `Based on my regional and local markets expertise for "${query}":\\n\\n`;
        
        // Market-specific intro
        if (targetMarket === 'both' || this.isExplicitCrossMarketRequest(query.toLowerCase())) {
            response += `**Cross-Regional Analysis (US SLED & Canada MASH):**\\n`;
        } else if (targetMarket === 'canada_mash') {
            response += `**Canadian MASH Market Analysis:**\\n`;
        } else {
            response += `**US SLED Market Analysis:**\\n`;
        }
        
        // State government analysis (US SLED)
        if (analysis.stateGov && (targetMarket === 'us_sled' || targetMarket === 'both')) {
            response += `\\n**State Government Opportunities:**\\n`;
            analysis.stateGov.relevantStates.slice(0, 2).forEach(state => {
                response += `- ${state.name}: Portal: ${state.procurementPortal}\\n`;
                response += `  Key Features: ${state.keyFeatures.join(', ')}\\n`;
            });
        }
        
        // Local government analysis (US SLED)
        if (analysis.localGov && (targetMarket === 'us_sled' || targetMarket === 'both')) {
            response += `\\n**Local Government Insights:**\\n`;
            analysis.localGov.governmentTypes.forEach(gov => {
                response += `- ${gov.description}\\n`;
                response += `  Average Contract Size: ${gov.averageContractSize}\\n`;
            });
        }
        
        // Education sector analysis
        if (analysis.education && (targetMarket === 'us_sled' || targetMarket === 'both')) {
            response += `\\n**Education Sector Opportunities:**\\n`;
            analysis.education.segments.forEach(segment => {
                response += `- ${segment.segment}: ${segment.marketSize}\\n`;
            });
        }
        
        // Municipal analysis (Canadian MASH)
        if (analysis.municipal && (targetMarket === 'canada_mash' || targetMarket === 'both')) {
            response += `\\n**Canadian Municipal Opportunities:**\\n`;
            analysis.municipal.municipalTypes.forEach(municipal => {
                response += `- ${municipal.description}\\n`;
                response += `  Average Contract Size: ${municipal.averageContractSize}\\n`;
            });
        }
        
        // Healthcare analysis (Canadian MASH)
        if (analysis.healthcare && (targetMarket === 'canada_mash' || targetMarket === 'both')) {
            response += `\\n**Healthcare Sector Insights:**\\n`;
            analysis.healthcare.healthcareSegments.forEach(segment => {
                response += `- ${segment.segment}: ${segment.description}\\n`;
            });
        }
        
        // Cross-regional comparison (only when explicitly requested)
        if (analysis.crossRegional && (targetMarket === 'both' || this.isExplicitCrossMarketRequest(query.toLowerCase()))) {
            response += `\\n**Cross-Regional Market Comparison:**\\n`;
            response += `US SLED Market: ${analysis.crossRegional.marketOverview.us_sled.marketSize}\\n`;
            response += `Canadian MASH Market: ${analysis.crossRegional.marketOverview.canada_mash.marketSize}\\n`;
        }
        
        return response;
    }

    generateRegionalResources(analysis, targetMarket) {
        const resources = [];
        
        // US SLED resources
        if (targetMarket === 'us_sled') {
            resources.push(
                {
                    title: 'NASPO ValuePoint - State Cooperative Contracts',
                    url: 'https://naspo.org',
                    description: 'National state cooperative purchasing programs'
                },
                {
                    title: 'OMNIA Partners - Public Sector Cooperative',
                    url: 'https://omniapartners.com',
                    description: 'Largest public sector cooperative purchasing organization'
                },
                {
                    title: 'Government Technology - SLED Market Intelligence',
                    url: 'https://govtech.com',
                    description: 'State and local government technology news and procurement information'
                },
                {
                    title: 'National School Boards Association',
                    url: 'https://nsba.org',
                    description: 'K-12 education procurement resources and best practices'
                }
            );
        }
        
        // Canadian MASH resources  
        else if (targetMarket === 'canada_mash') {
            resources.push(
                {
                    title: 'MERX - Canadian Public Tenders',
                    url: 'https://merx.com',
                    description: 'Primary Canadian public sector tender platform'
                },
                {
                    title: 'Canadian Public Procurement Council',
                    url: 'https://cppc-ccmp.ca',
                    description: 'Professional development and best practices for public procurement'
                },
                {
                    title: 'Federation of Canadian Municipalities',
                    url: 'https://fcm.ca',
                    description: 'Municipal government resources and procurement guidance'
                },
                {
                    title: 'Universities Canada',
                    url: 'https://univcan.ca',
                    description: 'University sector resources and procurement information'
                }
            );
        }
        
        // Cross-regional resources
        else if (targetMarket === 'both') {
            resources.push(
                {
                    title: 'NASPO ValuePoint - US State Cooperatives',
                    url: 'https://naspo.org',
                    description: 'National state cooperative purchasing programs'
                },
                {
                    title: 'MERX - Canadian Public Tenders',
                    url: 'https://merx.com',
                    description: 'Primary Canadian public sector tender platform'
                },
                {
                    title: 'Government Executive - Public Sector Intelligence',
                    url: 'https://govexec.com',
                    description: 'Cross-jurisdictional government market intelligence'
                },
                {
                    title: 'International City/County Management Association',
                    url: 'https://icma.org',
                    description: 'Local government management and procurement best practices'
                }
            );
        }
        
        return resources;
    }

    generateRegionalNextSteps(analysis, userProfile, targetMarket) {
        const steps = [];
        
        // US SLED focused steps
        if (targetMarket === 'us_sled') {
            steps.push(
                'Register with relevant state procurement portals in target states',
                'Research local business preference requirements and certifications',
                'Identify education sector cooperative purchasing opportunities',
                'Develop relationships with local government procurement officials'
            );
            
            if (analysis.education?.segments?.length > 0) {
                steps.push('Align marketing efforts with education sector budget cycles');
            }
            
            if (analysis.stateGov?.relevantStates?.length > 0) {
                steps.push('Review state-specific procurement regulations and preferences');
            }
        }
        
        // Canadian MASH focused steps
        else if (targetMarket === 'canada_mash') {
            steps.push(
                'Register on MERX and provincial procurement platforms',
                'Research Indigenous procurement opportunities and requirements',
                'Evaluate social procurement programs in target provinces',
                'Build relationships with municipal and academic procurement professionals'
            );
            
            if (analysis.healthcare?.healthcareSegments?.length > 0) {
                steps.push('Research healthcare group purchasing organization participation');
            }
            
            if (userProfile.location?.country !== 'canada') {
                steps.push('Consider establishing Canadian business presence or partnerships');
            }
        }
        
        // Cross-regional steps
        else if (targetMarket === 'both') {
            steps.push(
                'Develop market-specific capability statements for each region',
                'Research cooperative purchasing opportunities in both markets',
                'Consider regional partnership strategies for market entry',
                'Establish compliance procedures for both US and Canadian requirements',
                'Monitor procurement opportunities across both markets systematically'
            );
        }
        
        return steps;
    }

    /**
     * Assessment helper methods
     */
    assessStateOpportunity(state, userProfile) {
        return {
            opportunity: 'good',
            factors: [`Population: ${state.population}`, `Portal: ${state.procurementPortal}`],
            considerations: state.diversityPrograms
        };
    }

    assessLocalGovSuitability(govType, userProfile) {
        return {
            suitability: 'good',
            reasons: ['Matches service profile', 'Appropriate contract sizes'],
            timeline: govType.decisionTimeline
        };
    }

    assessEducationMarketFit(segment, userProfile) {
        return {
            fit: 'good',
            marketSize: segment.marketSize,
            keyDrivers: segment.keyDrivers
        };
    }

    assessMunicipalOpportunity(municipal, userProfile) {
        return {
            opportunity: 'good',
            contractSize: municipal.averageContractSize,
            considerations: municipal.keyConsiderations
        };
    }

    assessAcademicMarketFit(segment, userProfile) {
        return {
            fit: 'good',
            marketSize: segment.marketSize || 'Significant',
            governance: segment.governance
        };
    }

    assessHealthcareMarketFit(segment, userProfile) {
        return {
            fit: 'good',
            description: segment.description,
            focus: segment.procurementFocus
        };
    }

    assessCooperativeSuitability(program, userProfile) {
        return {
            suitability: 'good',
            benefits: program.benefits,
            coverage: program.coverage
        };
    }

    /**
     * Recommendation generation methods
     */
    generateStateGovRecommendations(stateAnalysis) {
        return stateAnalysis.relevantStates.map(state => ({
            type: 'state_registration',
            description: `Register with ${state.name} ${state.procurementPortal} for state opportunities`,
            priority: 'high',
            market: 'us_sled'
        }));
    }

    generateLocalGovRecommendations(localAnalysis) {
        return localAnalysis.governmentTypes.map(gov => ({
            type: 'local_government_focus',
            description: `Target ${gov.description.toLowerCase()} with average contracts of ${gov.averageContractSize}`,
            priority: 'medium',
            market: 'us_sled'
        }));
    }

    generateEducationRecommendations(educationAnalysis) {
        return educationAnalysis.segments.map(segment => ({
            type: 'education_sector',
            description: `Pursue ${segment.segment} opportunities in ${segment.marketSize} market`,
            priority: 'medium',
            market: 'us_sled'
        }));
    }

    generateMunicipalRecommendations(municipalAnalysis) {
        return municipalAnalysis.municipalTypes.map(municipal => ({
            type: 'municipal_government',
            description: `Target ${municipal.description.toLowerCase()} opportunities`,
            priority: 'high',
            market: 'canada_mash'
        }));
    }

    generateAcademicRecommendations(academicAnalysis) {
        return academicAnalysis.academicSegments.map(segment => ({
            type: 'academic_sector',
            description: `Explore ${segment.segment} procurement opportunities`,
            priority: 'medium',
            market: 'canada_mash'
        }));
    }

    generateHealthcareRecommendations(healthcareAnalysis) {
        return healthcareAnalysis.healthcareSegments.map(segment => ({
            type: 'healthcare_sector',
            description: `Consider ${segment.segment} contracting opportunities`,
            priority: 'medium',
            market: 'canada_mash'
        }));
    }

    generateCooperativeRecommendations(cooperativeAnalysis) {
        return cooperativeAnalysis.relevantPrograms.map(program => ({
            type: 'cooperative_purchasing',
            description: `Explore ${program.name} cooperative contracts for ${program.coverage} coverage`,
            priority: 'high',
            market: program.market
        }));
    }

    generateCrossRegionalRecommendations(crossRegionalAnalysis) {
        return [
            {
                type: 'market_comparison',
                description: 'Consider phased market entry approach starting with stronger market position',
                priority: 'high',
                market: 'both'
            },
            {
                type: 'regional_strategy',
                description: 'Develop region-specific compliance and relationship strategies',
                priority: 'medium',
                market: 'both'
            }
        ];
    }

    generateCrossRegionalStrategicRecommendations(comparison) {
        return [
            'Assess competitive positioning in both US SLED and Canadian MASH markets',
            'Consider market entry timing based on procurement cycles and budget availability',
            'Evaluate partnership opportunities for local market knowledge and relationships',
            'Develop compliance procedures for both US and Canadian procurement requirements'
        ];
    }

    /**
     * Generate market-focused general guidance
     */
    generateGeneralRegionalGuidance(query, userProfile, targetMarket) {
        const marketDescription = targetMarket === 'both' ? 'US SLED and Canadian MASH markets' :
                                 targetMarket === 'canada_mash' ? 'Canadian MASH market' :
                                 'US SLED market';
        
        let content, recommendations;
        
        if (targetMarket === 'us_sled') {
            content = `For US SLED market guidance on "${query}", I recommend focusing on state and local government opportunities, education sector procurement, and cooperative purchasing programs. The SLED market offers diverse opportunities across 50 states with varying procurement processes and preferences.`;
            recommendations = [
                'Register with state procurement portals in target states',
                'Research local business preferences and certification requirements',
                'Explore education sector cooperative purchasing programs (NASPO, OMNIA)',
                'Build relationships with procurement officials at multiple government levels',
                'Understand prevailing wage and transparency requirements'
            ];
        } else if (targetMarket === 'canada_mash') {
            content = `For Canadian MASH market guidance on "${query}", I recommend focusing on municipal governments, academic institutions, social services, and healthcare organizations. The MASH market emphasizes social procurement, Indigenous opportunities, and relationship-building.`;
            recommendations = [
                'Register on MERX and relevant provincial procurement platforms',
                'Research Indigenous procurement targets and social procurement programs',
                'Build relationships with municipal and academic procurement professionals',
                'Consider healthcare group purchasing organization opportunities',
                'Ensure compliance with provincial trade agreement requirements'
            ];
        } else {
            content = `For cross-regional guidance on "${query}", I recommend understanding the distinct characteristics of US SLED and Canadian MASH markets. Each region has unique procurement cultures, regulatory environments, and business relationship approaches.`;
            recommendations = [
                'Compare market opportunities and competitive landscapes in both regions',
                'Develop region-specific market entry and relationship strategies',
                'Consider cooperative purchasing opportunities in both markets',
                'Evaluate partnership opportunities with local firms',
                'Plan phased market entry based on resource availability and market readiness'
            ];
        }
        
        return {
            agentId: this.agentId,
            agentName: this.name,
            query,
            targetMarket,
            content,
            recommendations,
            resources: this.generateRegionalResources({}, targetMarket),
            nextSteps: this.generateRegionalNextSteps({}, userProfile, targetMarket),
            confidence: 0.7
        };
    }
}

module.exports = RegionalLocalMarketsAgent;