/**
 * North American Federal Markets Agent
 * 
 * Specialized hybrid agent for US and Canadian federal contracting with expertise in:
 * 
 * US Federal Markets:
 * - NAICS codes and industry classifications
 * - Federal set-asides and socioeconomic programs  
 * - FAR (Federal Acquisition Regulation) compliance
 * - GSA schedules and contracting vehicles
 * - US federal procurement cycles and timelines
 * 
 * Canadian Federal Markets:
 * - NAICS codes (Canadian context)
 * - Indigenous business programs and supplier diversity
 * - PSPC (Public Services and Procurement Canada) processes
 * - Standing offers and supply arrangements
 * - Canadian federal procurement policies
 * 
 * Cross-Market Capabilities:
 * - US-Canada procurement comparison and analysis
 * - Market entry strategies for both jurisdictions
 * - Cross-border opportunity assessment
 */

class NorthAmericanFederalAgent {
    constructor() {
        this.agentId = 'north-american-federal';
        this.name = 'North American Federal Markets Specialist';
        this.version = '2.0.0';
        
        this.expertise = [
            'us_federal_contracting',
            'canadian_federal_procurement',
            'naics_codes_cross_border',
            'us_set_asides',
            'canadian_supplier_diversity',
            'far_regulations',
            'pspc_policies',
            'gsa_schedules',
            'standing_offers',
            'cross_market_analysis'
        ];
        
        this.capabilities = [
            'us_naics_analysis',
            'canadian_naics_analysis',
            'us_set_aside_identification',
            'canadian_supplier_diversity_assessment',
            'far_compliance_check',
            'pspc_process_guidance',
            'gsa_schedule_guidance',
            'standing_offer_analysis',
            'cross_market_comparison',
            'dual_market_strategy',
            'procurement_timeline_analysis',
            'solicitation_evaluation',
            'opportunity_scoring',
            'federal_search_optimization'
        ];
        
        this.supportedMarkets = ['us', 'canada', 'cross_border'];
        
        this.initializeKnowledgeBases();
    }

    /**
     * Initialize North American federal contracting knowledge bases
     */
    initializeKnowledgeBases() {
        // Initialize US and Canadian market data
        this.initializeUSFederalData();
        this.initializeCanadianFederalData();
        this.initializeCrossMarketData();
    }

    /**
     * Initialize US Federal market data
     */
    initializeUSFederalData() {
        // US NAICS code database (subset for demonstration)
        this.usNaicsCodes = {
            '541511': {
                title: 'Custom Computer Programming Services',
                description: 'Writing, modifying, testing, and supporting software to meet the needs of a particular customer',
                sizeStandard: '$47.0 million',
                commonSetAsides: ['8(a)', 'HUBZone', 'WOSB', 'VOSB', 'SDVOSB'],
                relatedCodes: ['541512', '541513', '541519']
            },
            '541512': {
                title: 'Computer Systems Design Services',
                description: 'Planning and designing computer systems that integrate computer hardware, software, and communication technologies',
                sizeStandard: '$47.0 million',
                commonSetAsides: ['8(a)', 'HUBZone', 'WOSB', 'VOSB', 'SDVOSB'],
                relatedCodes: ['541511', '541513', '541519']
            },
            '541330': {
                title: 'Engineering Services',
                description: 'Applying physical laws and principles of engineering in the design of machines, materials, instruments, structures, processes, and systems',
                sizeStandard: '$22.5 million',
                commonSetAsides: ['8(a)', 'HUBZone', 'WOSB', 'VOSB', 'SDVOSB'],
                relatedCodes: ['541310', '541320', '541350']
            },
            '541611': {
                title: 'Administrative Management and General Management Consulting Services',
                description: 'Providing operating advice and assistance to management',
                sizeStandard: '$22.5 million',
                commonSetAsides: ['8(a)', 'HUBZone', 'WOSB', 'VOSB', 'SDVOSB'],
                relatedCodes: ['541612', '541613', '541618']
            }
        };

        // US Federal set-aside programs
        this.usSetAsidePrograms = {
            '8a': {
                name: '8(a) Business Development Program',
                description: 'Program for small disadvantaged businesses',
                eligibility: 'Small disadvantaged business owned by socially and economically disadvantaged individuals',
                advantages: ['Sole source contracts up to $4.5M (manufacturing) / $7M (all other)', 'Competitive set-aside opportunities'],
                duration: '9 years maximum',
                certifyingAgency: 'SBA'
            },
            'hubzone': {
                name: 'Historically Underutilized Business Zone (HUBZone)',
                description: 'Program for businesses in underutilized business zones',
                eligibility: 'Small business located in HUBZone with 35% of employees living in HUBZone',
                advantages: ['Competitive and sole source set-asides', '10% price evaluation preference in full and open competition'],
                duration: '3 years certification',
                certifyingAgency: 'SBA'
            },
            'wosb': {
                name: 'Women-Owned Small Business (WOSB)',
                description: 'Program for women-owned small businesses',
                eligibility: 'Small business that is at least 51% owned and controlled by women',
                advantages: ['Set-aside competitions in underrepresented industries', 'Sole source awards up to $7M'],
                duration: 'Annual recertification',
                certifyingAgency: 'SBA or Third-party certifier'
            },
            'vosb': {
                name: 'Veteran-Owned Small Business (VOSB)',
                description: 'Program for veteran-owned small businesses',
                eligibility: 'Small business that is at least 51% owned and controlled by veterans',
                advantages: ['Set-aside opportunities', 'Subcontracting opportunities'],
                duration: 'Annual verification',
                certifyingAgency: 'VA (VetBiz) or SBA'
            },
            'sdvosb': {
                name: 'Service-Disabled Veteran-Owned Small Business (SDVOSB)',
                description: 'Program for service-disabled veteran-owned small businesses',
                eligibility: 'Small business owned by service-disabled veteran',
                advantages: ['Set-aside and sole source opportunities up to $5.5M', 'Subcontracting goals'],
                duration: 'Annual verification',
                certifyingAgency: 'VA (VetBiz) or SBA'
            }
        };

        // US GSA Schedule information
        this.usGSASchedules = {
            'MAS': {
                name: 'Multiple Award Schedule (MAS)',
                description: 'Streamlined acquisition vehicle for federal agencies',
                categories: ['IT', 'Professional Services', 'Facilities', 'Industrial Products'],
                benefits: ['Pre-competed contracts', 'Streamlined ordering', 'Best in class designations'],
                requirements: ['2+ years in business', 'Commercial sales', 'Financial capability']
            },
            '70': {
                name: 'General Purpose Commercial Information Technology Equipment, Software, and Services',
                description: 'IT products and services',
                subcategories: ['Hardware', 'Software', 'IT Services'],
                popularSINs: ['132-51', '132-50', '132-45A']
            },
            '541': {
                name: 'Professional Services Schedule',
                description: 'Professional and consulting services',
                subcategories: ['Management Consulting', 'Engineering', 'Environmental'],
                popularSINs: ['541-1', '541-2', '541-4B']
            }
        };

        // US Federal procurement cycle knowledge
        this.usProcurementCycles = {
            'planning': {
                phase: 'Market Research and Planning',
                duration: '3-6 months',
                activities: ['Market research', 'Requirements definition', 'Acquisition strategy', 'Budget allocation'],
                opportunities: ['Industry days', 'RFI responses', 'One-on-one meetings']
            },
            'solicitation': {
                phase: 'Solicitation Development',
                duration: '2-4 months',
                activities: ['SOW development', 'Evaluation criteria', 'Contract terms'],
                opportunities: ['Pre-solicitation conferences', 'Draft RFP comments']
            },
            'competition': {
                phase: 'Competition Period',
                duration: '30-60 days',
                activities: ['Proposal submission', 'Q&A period', 'Proposal evaluation'],
                opportunities: ['Proposal submission', 'Oral presentations', 'Site visits']
            },
            'award': {
                phase: 'Award and Performance',
                duration: 'Contract term',
                activities: ['Contract award', 'Performance', 'Modifications'],
                opportunities: ['Task orders', 'Contract modifications', 'Recompetes']
            }
        };

        // US FAR regulation key sections
        this.usFARSections = {
            'part15': {
                title: 'Contracting by Negotiation',
                keySubparts: ['15.3 - Source Selection', '15.4 - Contract Pricing', '15.6 - Unsolicited Proposals'],
                importance: 'Governs most complex federal acquisitions'
            },
            'part19': {
                title: 'Small Business Programs',
                keySubparts: ['19.5 - Set-Asides', '19.7 - Subcontracting Plans', '19.13 - Historically Underutilized Business Zone'],
                importance: 'Critical for small business participation'
            },
            'part16': {
                title: 'Types of Contracts',
                keySubparts: ['16.2 - Fixed-Price Contracts', '16.3 - Cost-Reimbursement Contracts', '16.5 - Indefinite-Delivery Contracts'],
                importance: 'Understanding contract types and risks'
            }
        };
    }

    /**
     * Initialize Canadian Federal market data
     */
    initializeCanadianFederalData() {
        // Canadian NAICS codes (similar structure but different context)
        this.canadianNaicsCodes = {
            '541511': {
                title: 'Custom Computer Programming Services',
                description: 'Writing, modifying, testing, and supporting software to meet the needs of a particular customer',
                sizeStandard: 'Small: <100 employees, Medium: 100-499 employees',
                commonPrograms: ['Indigenous Business', 'Quebec Business', 'Women-owned Enterprise'],
                relatedCodes: ['541512', '541513', '541519']
            },
            '541330': {
                title: 'Engineering Services',
                description: 'Applying physical laws and principles of engineering in design and analysis',
                sizeStandard: 'Small: <100 employees, Medium: 100-499 employees',
                commonPrograms: ['Indigenous Business', 'Quebec Business', 'Women-owned Enterprise'],
                relatedCodes: ['541310', '541320', '541350']
            }
        };

        // Canadian supplier diversity programs
        this.canadianSupplierPrograms = {
            'indigenous': {
                name: 'Procurement Strategy for Indigenous Business (PSIB)',
                description: 'Mandatory minimum target of 5% of total federal procurement for Indigenous businesses',
                eligibility: 'Indigenous-owned business (51% ownership by Indigenous persons)',
                advantages: [
                    'Set-aside opportunities',
                    'Sole source contracts up to $40,000',
                    '5% price advantage in competitive processes'
                ],
                certifyingBodies: ['Indigenous Services Canada', 'Canadian Council for Indigenous Business'],
                target: '5% of federal procurement by 2024'
            },
            'quebec_business': {
                name: 'Quebec-based Business Priority',
                description: 'Regional preference for Quebec businesses',
                eligibility: 'Business established in Quebec',
                advantages: ['Regional preferences in certain procurements', 'Local supplier considerations'],
                considerations: ['Language requirements (French)', 'Provincial regulations']
            },
            'women_owned': {
                name: 'Women-owned Enterprise Initiative',
                description: 'Support for women-owned businesses in federal procurement',
                eligibility: 'Business owned and controlled by women (51% ownership)',
                advantages: ['Targeted opportunities', 'Capacity building support'],
                certifyingBodies: ['WEConnect Canada', 'Women Business Enterprises Canada Council']
            },
            'disability_owned': {
                name: 'Businesses owned by persons with disabilities',
                description: 'Support for disability-owned enterprises',
                eligibility: 'Business owned by persons with disabilities',
                advantages: ['Specialized set-asides', 'Accessibility-focused opportunities']
            }
        };

        // PSPC procurement methods and tools
        this.pspcProcurementMethods = {
            'standing_offers': {
                name: 'Standing Offers',
                description: 'Pre-qualified suppliers for routine, repetitive purchases',
                characteristics: [
                    'Pre-established terms and conditions',
                    'Streamlined call-up process',
                    'Usually 2-5 year terms'
                ],
                callUpLimits: {
                    'goods': '$25,000',
                    'services': '$40,000',
                    'construction': '$100,000'
                },
                advantages: ['Reduced administrative burden', 'Faster procurement', 'Predictable terms']
            },
            'supply_arrangements': {
                name: 'Supply Arrangements',
                description: 'Method for acquiring goods and services from pre-qualified suppliers',
                characteristics: [
                    'Competitive selection process',
                    'Multiple suppliers pre-qualified',
                    'Task-based call-ups'
                ],
                advantages: ['Flexibility', 'Competition among pre-qualified suppliers', 'Scalable solutions']
            },
            'request_for_proposal': {
                name: 'Request for Proposal (RFP)',
                description: 'Competitive process for complex requirements',
                thresholds: {
                    'goods': 'Over $25,000',
                    'services': 'Over $40,000',
                    'construction': 'Over $100,000'
                },
                evaluation: 'Best overall value to Canada'
            },
            'advance_contract_award_notice': {
                name: 'Advance Contract Award Notice (ACAN)',
                description: 'Intended award to single supplier with opportunity for others to challenge',
                usage: 'When only one supplier can meet requirements',
                challengePeriod: '15 calendar days'
            }
        };

        // Canadian federal procurement policies
        this.canadianProcurementPolicies = {
            'trade_agreements': {
                name: 'Trade Agreement Compliance',
                agreements: [
                    'Canadian Free Trade Agreement (CFTA)',
                    'Comprehensive Economic and Trade Agreement (CETA)',
                    'World Trade Organization Agreement on Government Procurement (WTO-AGP)'
                ],
                thresholds: {
                    'CFTA_goods': '$25,700',
                    'CFTA_services': '$112,900',
                    'CETA_goods': '$267,000',
                    'CETA_services': '$267,000'
                }
            },
            'green_procurement': {
                name: 'Green Procurement Policy',
                description: 'Reducing environmental impact of government operations',
                requirements: [
                    'Environmental considerations in procurement decisions',
                    'Life-cycle assessment',
                    'Sustainable goods and services preference'
                ]
            },
            'accessibility_standards': {
                name: 'Accessibility Standards for Procurement',
                description: 'Ensuring accessibility in federal procurement',
                requirements: [
                    'WCAG 2.1 Level AA compliance for ICT',
                    'Barrier-free design considerations',
                    'Accessibility testing and validation'
                ]
            }
        };

        // Canadian procurement cycles
        this.canadianProcurementCycles = {
            'planning': {
                phase: 'Procurement Planning',
                duration: '2-4 months',
                activities: ['Requirements definition', 'Market research', 'Procurement strategy', 'Trade agreement analysis'],
                considerations: ['Indigenous procurement targets', 'Trade agreement compliance', 'Green procurement requirements']
            },
            'solicitation': {
                phase: 'Solicitation Process',
                duration: '30-60 days',
                activities: ['RFP development', 'Supplier engagement', 'Question period'],
                requirements: ['Official languages compliance', 'Accessibility standards', 'Trade agreement posting']
            },
            'evaluation': {
                phase: 'Evaluation and Award',
                duration: '30-90 days',
                activities: ['Proposal evaluation', 'Due diligence', 'Contract negotiation'],
                considerations: ['Best overall value to Canada', 'Supplier verification', 'Integrity regime compliance']
            }
        };

        // Canadian federal search platforms
        this.canadianSearchPlatforms = {
            'buyandsell': {
                name: 'BuyandSell.gc.ca',
                description: 'Primary source for Canadian federal procurement opportunities',
                features: ['Tender notices', 'Award notices', 'Standing offer calls', 'Supplier registration'],
                searchCapabilities: ['NAICS filtering', 'Region filtering', 'Value filtering', 'Closing date sorting']
            },
            'ssc_services': {
                name: 'Shared Services Canada Procurement',
                description: 'IT infrastructure and services procurement',
                focus: ['Data center services', 'Network services', 'End-user device management', 'Telecommunications']
            },
            'pwgsc_contracts': {
                name: 'PSPC Contracts Portal',
                description: 'Contract information and supplier resources',
                features: ['Contract history', 'Supplier performance', 'Procurement policies', 'Training resources']
            }
        };
    }

    /**
     * Initialize cross-market comparison data
     */
    initializeCrossMarketData() {
        // Market comparison framework
        this.marketComparisons = {
            'procurement_thresholds': {
                us: {
                    'micro_purchase': '$10,000',
                    'simplified_acquisition': '$250,000',
                    'formal_competition': '$250,000+'
                },
                canada: {
                    'low_value': '$25,000 (goods), $40,000 (services)',
                    'trade_agreement': '$25,700-$267,000',
                    'high_value': '$267,000+'
                }
            },
            'small_business_definitions': {
                us: 'Varies by NAICS (revenue-based: $1M-$47M)',
                canada: 'Generally <100 employees (goods), <500 employees (services)'
            },
            'supplier_diversity': {
                us: ['8(a)', 'HUBZone', 'WOSB', 'VOSB', 'SDVOSB'],
                canada: ['Indigenous Business', 'Women-owned Enterprise', 'Quebec Business', 'Disability-owned']
            },
            'procurement_portals': {
                us: ['SAM.gov', 'eBuy', 'GSA Advantage'],
                canada: ['BuyandSell.gc.ca', 'PSPC Contracts Portal']
            },
            'fiscal_years': {
                us: 'October 1 - September 30',
                canada: 'April 1 - March 31'
            }
        };

        // Cross-market opportunities
        this.crossMarketOpportunities = {
            'joint_ventures': {
                description: 'US-Canada business partnerships for cross-border opportunities',
                benefits: ['Market access', 'Local presence', 'Compliance support'],
                considerations: ['Partnership agreements', 'Revenue sharing', 'Regulatory compliance']
            },
            'trade_agreements': {
                description: 'USMCA benefits for cross-border procurement',
                benefits: ['Reduced trade barriers', 'Government procurement access', 'Standards harmonization'],
                requirements: ['Origin requirements', 'Technical standards compliance']
            },
            'subsidiary_strategies': {
                description: 'Establishing local presence in target market',
                benefits: ['Local business status', 'Direct market access', 'Cultural understanding'],
                considerations: ['Legal requirements', 'Tax implications', 'Operational complexity']
            }
        };
    }

    /**
     * Analyze NAICS code relevance and opportunities for target market
     */
    analyzeNAICSCodes(query, userProfile = {}, targetMarket = 'us') {
        const queryLower = query.toLowerCase();
        const analysis = {
            targetMarket,
            relevantCodes: [],
            crossMarketComparison: null
        };
        
        // Determine which markets to analyze
        const marketsToAnalyze = targetMarket === 'both' ? ['us', 'canada'] : [targetMarket];
        
        marketsToAnalyze.forEach(market => {
            const naicsDatabase = market === 'us' ? this.usNaicsCodes : this.canadianNaicsCodes;
            const marketCodes = [];
            
            // Search for relevant NAICS codes based on query
            Object.entries(naicsDatabase).forEach(([code, info]) => {
                let relevanceScore = 0;
                
                // Check title match
                if (info.title.toLowerCase().includes(queryLower) || 
                    queryLower.includes(info.title.toLowerCase().split(' ').slice(0, 2).join(' ').toLowerCase())) {
                    relevanceScore += 0.8;
                }
                
                // Check description match
                const descriptionWords = info.description.toLowerCase().split(' ');
                const queryWords = queryLower.split(' ');
                const commonWords = descriptionWords.filter(word => queryWords.includes(word) && word.length > 3);
                relevanceScore += (commonWords.length / queryWords.length) * 0.6;
                
                if (relevanceScore > 0.3) {
                    marketCodes.push({
                        code,
                        market,
                        ...info,
                        relevanceScore,
                        opportunities: this.assessNAICSOpportunities(code, info, userProfile, market)
                    });
                }
            });
            
            analysis.relevantCodes.push(...marketCodes);
        });
        
        // Sort by relevance and limit results
        analysis.relevantCodes = analysis.relevantCodes
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, 6); // More codes for cross-market analysis
        
        // Add cross-market comparison if analyzing both markets
        if (targetMarket === 'both') {
            analysis.crossMarketComparison = this.compareNAICSAcrossMarkets(analysis.relevantCodes);
        }
        
        return analysis;
    }

    /**
     * Assess opportunities for specific NAICS code in target market
     */
    assessNAICSOpportunities(code, naicsInfo, userProfile, market = 'us') {
        const opportunities = [];
        
        // Set-aside opportunities
        if (userProfile.certifications) {
            naicsInfo.commonSetAsides.forEach(setAside => {
                if (userProfile.certifications.includes(setAside.toLowerCase())) {
                    opportunities.push({
                        type: 'set_aside',
                        program: setAside,
                        description: `Eligible for ${setAside} set-aside opportunities`,
                        priority: 'high'
                    });
                }
            });
        }
        
        // General federal opportunities
        opportunities.push({
            type: 'unrestricted',
            description: 'Open competition opportunities',
            priority: 'medium',
            considerations: [`Size standard: ${naicsInfo.sizeStandard}`, 'Compete against all business sizes']
        });
        
        // Subcontracting opportunities
        opportunities.push({
            type: 'subcontracting',
            description: 'Prime contractor subcontracting opportunities',
            priority: 'medium',
            considerations: ['Lower barriers to entry', 'Build federal experience', 'Develop relationships']
        });
        
        // Market-specific opportunities
        if (market === 'us') {
            // US set-aside opportunities
            if (userProfile.certifications) {
                const setAsidePrograms = naicsInfo.commonSetAsides || [];
                setAsidePrograms.forEach(setAside => {
                    if (userProfile.certifications.includes(setAside.toLowerCase())) {
                        opportunities.push({
                            type: 'set_aside',
                            program: setAside,
                            description: `Eligible for ${setAside} set-aside opportunities`,
                            priority: 'high',
                            market: 'us'
                        });
                    }
                });
            }
            
            // GSA Schedule opportunities
            opportunities.push({
                type: 'gsa_schedule',
                description: 'GSA Schedule contracting vehicle eligibility',
                priority: 'medium',
                market: 'us',
                considerations: [`Size standard: ${naicsInfo.sizeStandard}`, 'Pre-competed contract vehicle']
            });
        } else if (market === 'canada') {
            // Canadian supplier diversity opportunities
            if (userProfile.canadianCertifications) {
                const supplierPrograms = naicsInfo.commonPrograms || [];
                supplierPrograms.forEach(program => {
                    if (userProfile.canadianCertifications.includes(program.toLowerCase().replace(/[^a-z]/g, '_'))) {
                        opportunities.push({
                            type: 'supplier_diversity',
                            program: program,
                            description: `Eligible for ${program} opportunities`,
                            priority: 'high',
                            market: 'canada'
                        });
                    }
                });
            }
            
            // Standing offer opportunities
            opportunities.push({
                type: 'standing_offer',
                description: 'Standing offer pre-qualification eligibility',
                priority: 'medium',
                market: 'canada',
                considerations: [`Size standard: ${naicsInfo.sizeStandard}`, 'Pre-qualified supplier status']
            });
        }
        
        // General opportunities (both markets)
        opportunities.push({
            type: 'open_competition',
            description: 'Open competition opportunities',
            priority: 'medium',
            market: market,
            considerations: ['Compete against all business sizes', 'Best value evaluation']
        });
        
        return opportunities;
    }

    /**
     * Compare NAICS opportunities across US and Canadian markets
     */
    compareNAICSAcrossMarkets(relevantCodes) {
        const comparison = {
            commonCodes: [],
            marketDifferences: {},
            opportunityAnalysis: {},
            strategicRecommendations: []
        };

        // Find codes present in both markets
        const usCodes = relevantCodes.filter(code => code.market === 'us');
        const canadaCodes = relevantCodes.filter(code => code.market === 'canada');

        usCodes.forEach(usCode => {
            const canadaEquivalent = canadaCodes.find(caCode => caCode.code === usCode.code);
            if (canadaEquivalent) {
                comparison.commonCodes.push({
                    code: usCode.code,
                    title: usCode.title,
                    us: usCode,
                    canada: canadaEquivalent,
                    differences: this.identifyCodeDifferences(usCode, canadaEquivalent)
                });
            }
        });

        // Market-specific analysis
        comparison.marketDifferences = {
            sizeStandards: this.compareSizeStandards(usCodes, canadaCodes),
            supplierPrograms: this.compareSupplierPrograms(),
            procurementMethods: this.compareProcurementMethods()
        };

        // Strategic recommendations for cross-market entry
        comparison.strategicRecommendations = this.generateCrossMarketStrategy(comparison.commonCodes);

        return comparison;
    }

    /**
     * Analyze Canadian supplier diversity programs
     */
    analyzeCanadianSupplierPrograms(query, userProfile = {}) {
        const analysis = {
            eligiblePrograms: [],
            recommendations: [],
            opportunities: [],
            requirements: []
        };

        // Assess eligibility for Canadian programs
        Object.entries(this.canadianSupplierPrograms).forEach(([key, program]) => {
            const eligibility = this.assessCanadianProgramEligibility(program, userProfile);
            if (eligibility.potentialEligibility) {
                analysis.eligiblePrograms.push({
                    programKey: key,
                    ...program,
                    eligibility: eligibility,
                    marketOpportunity: this.assessCanadianMarketOpportunity(program, query)
                });
            }
        });

        // Generate recommendations
        analysis.recommendations = this.generateCanadianSupplierRecommendations(analysis.eligiblePrograms);

        return analysis;
    }

    /**
     * Analyze PSPC procurement methods and standing offers
     */
    analyzePSPCProcurement(query, userProfile = {}) {
        const analysis = {
            applicableMethods: [],
            standingOfferOpportunities: [],
            requirements: [],
            timeline: {}
        };

        // Identify applicable procurement methods
        Object.entries(this.pspcProcurementMethods).forEach(([key, method]) => {
            const relevance = this.assessProcurementMethodRelevance(method, query);
            if (relevance > 0.5) {
                analysis.applicableMethods.push({
                    methodKey: key,
                    ...method,
                    relevance: relevance,
                    suitability: this.assessMethodSuitability(method, userProfile)
                });
            }
        });

        // Standing offer analysis
        analysis.standingOfferOpportunities = this.identifyStandingOfferOpportunities(query, userProfile);

        return analysis;
    }

    /**
     * Perform cross-market comparison analysis
     */
    performCrossMarketComparison(query, userProfile = {}) {
        const comparison = {
            marketOverview: {},
            procurementDifferences: {},
            opportunityComparison: {},
            entryStrategies: {},
            recommendations: []
        };

        // Market overview comparison
        comparison.marketOverview = {
            us: {
                marketSize: 'Large ($600+ billion annually)',
                competition: 'High',
                barriers: 'Complex regulations, high competition',
                advantages: 'Large market size, established processes'
            },
            canada: {
                marketSize: 'Medium ($25+ billion annually)',
                competition: 'Moderate',
                barriers: 'Language requirements, trade agreements',
                advantages: 'Less competition, Indigenous opportunities'
            }
        };

        // Procurement differences
        comparison.procurementDifferences = this.marketComparisons;

        // Opportunity comparison
        comparison.opportunityComparison = this.compareOpportunitiesAcrossMarkets(query, userProfile);

        // Entry strategies
        comparison.entryStrategies = this.generateMarketEntryStrategies(userProfile);

        // Strategic recommendations
        comparison.recommendations = this.generateCrossMarketRecommendations(comparison);

        return comparison;
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
            if (this.isNAICSQuery(queryLower)) {
                response.analysis.naics = this.analyzeNAICSCodes(query, userProfile, targetMarket);
                response.recommendations.push(...this.generateNAICSRecommendations(response.analysis.naics, targetMarket));
            }

            if (this.isUSSetAsideQuery(queryLower) && (targetMarket === 'us' || targetMarket === 'both')) {
                response.analysis.usSetAsides = this.analyzeSetAsides(query, userProfile);
                response.recommendations.push(...this.generateSetAsideRecommendations(response.analysis.usSetAsides));
            }

            if (this.isCanadianSupplierQuery(queryLower) && (targetMarket === 'canada' || targetMarket === 'both')) {
                response.analysis.canadianSupplier = this.analyzeCanadianSupplierPrograms(query, userProfile);
                response.recommendations.push(...this.generateCanadianSupplierRecommendations(response.analysis.canadianSupplier));
            }

            if (this.isFARQuery(queryLower) && (targetMarket === 'us' || targetMarket === 'both')) {
                response.analysis.farGuidance = this.provideFARGuidance(query);
                response.recommendations.push(...this.generateFARRecommendations(response.analysis.farGuidance));
            }

            if (this.isPSPCQuery(queryLower) && (targetMarket === 'canada' || targetMarket === 'both')) {
                response.analysis.pspc = this.analyzePSPCProcurement(query, userProfile);
                response.recommendations.push(...this.generatePSPCRecommendations(response.analysis.pspc));
            }

            if (this.isGSAQuery(queryLower) && (targetMarket === 'us' || targetMarket === 'both')) {
                response.analysis.gsa = this.analyzeGSASchedules(query, userProfile);
                response.recommendations.push(...this.generateGSARecommendations(response.analysis.gsa));
            }

            if (this.isStandingOfferQuery(queryLower) && (targetMarket === 'canada' || targetMarket === 'both')) {
                response.analysis.standingOffers = this.analyzeStandingOffers(query, userProfile);
                response.recommendations.push(...this.generateStandingOfferRecommendations(response.analysis.standingOffers));
            }

            if (this.isCrossMarketQuery(queryLower) || targetMarket === 'both') {
                response.analysis.crossMarket = this.performCrossMarketComparison(query, userProfile);
                response.recommendations.push(...this.generateCrossMarketRecommendations(response.analysis.crossMarket));
            }

            // Generate comprehensive response
            response.content = this.generateNorthAmericanResponse(response.analysis, query, targetMarket);
            response.resources = this.generateNorthAmericanResources(response.analysis, targetMarket);
            response.nextSteps = this.generateNorthAmericanNextSteps(response.analysis, userProfile, targetMarket);

            // If no specific analysis matched, provide general guidance
            if (Object.keys(response.analysis).length === 0) {
                response = this.generateGeneralNorthAmericanGuidance(query, userProfile, targetMarket);
            }

            return response;

        } catch (error) {
            console.error('North American Federal Agent error:', error);
            return {
                ...response,
                error: true,
                content: 'I encountered an error analyzing your federal contracting query. Please try rephrasing your question or contact support.',
                confidence: 0.1
            };
        }
    }

    /**
     * Determine target market from query and context
     */
    determineTargetMarket(queryLower, context = {}) {
        // Cross-market indicators (check first - highest priority)
        if (this.isExplicitCrossMarketRequest(queryLower)) {
            return 'both';
        }
        
        // Explicit Canadian market indicators
        if (/\bcanada\b|\bcanadian\b|\.ca\b|pspc|buyandsell|indigenous.*business|standing.*offer|supply.*arrangement/i.test(queryLower)) {
            return 'canada';
        }
        
        // Explicit US market indicators
        if (/\bus\b|\busa\b|\bunited states\b|\bamerican\b|sam\.gov|gsa|far\b|8\(a\)|hubzone|wosb|vosb|sdvosb/i.test(queryLower)) {
            return 'us';
        }

        // Context-based determination (user's location/profile)
        if (context.user?.location?.country) {
            return context.user.location.country.toLowerCase() === 'canada' ? 'canada' : 'us';
        }
        
        // Default to US market (largest federal market) when no clear indicators
        return 'us';
    }
    
    /**
     * Check if query explicitly requests cross-market comparison
     */
    isExplicitCrossMarketRequest(queryLower) {
        return /compare.*markets|cross.?border|both.*markets|us.*(?:vs|versus|compared to).*canada|canada.*(?:vs|versus|compared to).*us|north.*american.*comparison|difference.*between.*us.*canada/i.test(queryLower);
    }

    /**
     * Analyze set-aside eligibility and opportunities
     */
    analyzeSetAsides(query, userProfile = {}) {
        const analysis = {
            eligiblePrograms: [],
            recommendations: [],
            opportunities: []
        };
        
        // Determine eligible programs based on user profile
        if (userProfile.certifications) {
            userProfile.certifications.forEach(cert => {
                const program = this.setAsidePrograms[cert.toLowerCase()];
                if (program) {
                    analysis.eligiblePrograms.push({
                        program: cert.toUpperCase(),
                        ...program,
                        status: 'certified'
                    });
                }
            });
        }
        
        // Provide recommendations for potential programs
        if (analysis.eligiblePrograms.length === 0) {
            analysis.recommendations = [
                {
                    program: 'Small Business',
                    description: 'Determine if you qualify as a small business under relevant NAICS codes',
                    priority: 'high',
                    nextSteps: ['Check size standards', 'Review revenue requirements', 'Consider SBA certification']
                },
                {
                    program: 'WOSB/EDWOSB',
                    description: 'If woman-owned, consider WOSB certification',
                    priority: 'medium',
                    nextSteps: ['Review ownership requirements', 'Check underrepresented industries', 'Apply through SBA or certifier']
                }
            ];
        }
        
        // Identify opportunity types
        const opportunityTypes = this.identifyOpportunityTypes(query, userProfile);
        analysis.opportunities = opportunityTypes;
        
        return analysis;
    }

    /**
     * Provide FAR compliance guidance
     */
    provideFARGuidance(query, contractType = 'services') {
        const queryLower = query.toLowerCase();
        const relevantSections = [];
        
        // Identify relevant FAR sections based on query
        Object.entries(this.usFARSections).forEach(([part, info]) => {
            if (queryLower.includes(part.replace('part', '')) || 
                info.title.toLowerCase().split(' ').some(word => queryLower.includes(word))) {
                relevantSections.push({
                    part,
                    ...info,
                    applicability: this.assessFARApplicability(part, contractType, query)
                });
            }
        });
        
        // Add general guidance based on query context
        const guidance = {
            relevantSections,
            keyConsiderations: this.getKeyFARConsiderations(query, contractType),
            complianceChecklist: this.generateComplianceChecklist(query, contractType),
            commonPitfalls: this.identifyCommonFARPitfalls(contractType)
        };
        
        return guidance;
    }

    /**
     * Analyze GSA Schedule opportunities
     */
    analyzeGSASchedules(query, userProfile = {}) {
        const analysis = {
            relevantSchedules: [],
            benefits: [],
            requirements: [],
            nextSteps: []
        };
        
        const queryLower = query.toLowerCase();
        
        // Identify relevant schedules
        Object.entries(this.usGSASchedules).forEach(([schedule, info]) => {
            let relevance = 0;
            
            if (info.name.toLowerCase().includes(queryLower) || 
                queryLower.includes(info.name.toLowerCase().split(' ')[0].toLowerCase())) {
                relevance += 0.8;
            }
            
            if (info.categories && info.categories.some(cat => 
                queryLower.includes(cat.toLowerCase()) || cat.toLowerCase().includes(queryLower))) {
                relevance += 0.6;
            }
            
            if (relevance > 0.3) {
                analysis.relevantSchedules.push({
                    schedule,
                    ...info,
                    relevance,
                    fit: this.assessScheduleFit(info, userProfile)
                });
            }
        });
        
        // General GSA benefits
        analysis.benefits = [
            'Pre-competed contract vehicle',
            'Streamlined ordering process for agencies',
            'Marketing visibility through GSA Advantage',
            'Potential for large volume sales',
            'Credibility with federal buyers'
        ];
        
        // Requirements assessment
        analysis.requirements = this.assessGSARequirements(userProfile);
        
        // Next steps
        analysis.nextSteps = this.generateGSANextSteps(analysis.relevantSchedules, userProfile);
        
        return analysis;
    }

    /**
     * Analyze procurement cycles and timing
     */
    analyzeProcurementCycle(query, timeframe = 'current') {
        const analysis = {
            currentPhase: this.identifyCurrentPhase(query),
            timeline: [],
            opportunities: [],
            strategicConsiderations: []
        };
        
        // Build timeline based on identified phase
        if (analysis.currentPhase) {
            analysis.timeline = this.buildProcurementTimeline(analysis.currentPhase);
            analysis.opportunities = this.identifyPhaseOpportunities(analysis.currentPhase);
            analysis.strategicConsiderations = this.getStrategicConsiderations(analysis.currentPhase);
        }
        
        // Add federal fiscal year considerations
        analysis.fiscalYearConsiderations = this.getFiscalYearConsiderations();
        
        return analysis;
    }

    /**
     * Comprehensive solicitation analysis
     */
    analyzeSolicitation(solicitationData) {
        const analysis = {
            opportunityAssessment: {},
            competitiveAnalysis: {},
            requirementsAnalysis: {},
            riskAssessment: {},
            strategicRecommendations: []
        };
        
        // Opportunity assessment
        analysis.opportunityAssessment = {
            naicsCode: this.validateNAICSCode(solicitationData.naicsCode),
            setAsideType: this.identifySetAsideType(solicitationData),
            contractValue: this.assessContractValue(solicitationData.estimatedValue),
            contractType: this.analyzeContractType(solicitationData.contractType),
            performancePeriod: this.assessPerformancePeriod(solicitationData.performancePeriod)
        };
        
        // Competitive analysis
        analysis.competitiveAnalysis = {
            competitionLevel: this.assessCompetitionLevel(solicitationData),
            barrierToEntry: this.assessBarrierToEntry(solicitationData),
            incumbentAdvantage: this.assessIncumbentAdvantage(solicitationData),
            marketPosition: this.assessMarketPosition(solicitationData)
        };
        
        // Requirements analysis
        analysis.requirementsAnalysis = {
            technicalComplexity: this.assessTechnicalComplexity(solicitationData.requirements),
            complianceRequirements: this.identifyComplianceRequirements(solicitationData),
            pastPerformanceWeighting: this.assessPastPerformanceWeight(solicitationData.evaluationCriteria),
            proposalRequirements: this.analyzeProposalRequirements(solicitationData)
        };
        
        // Risk assessment
        analysis.riskAssessment = {
            technicalRisk: 'medium',
            scheduleRisk: 'low',
            performanceRisk: 'medium',
            financialRisk: 'low',
            mitigationStrategies: this.generateRiskMitigations(solicitationData)
        };
        
        // Strategic recommendations
        analysis.strategicRecommendations = this.generateStrategicRecommendations(analysis);
        
        return analysis;
    }

    /**
     * Optimize federal search workflows
     */
    optimizeFederalSearch(searchCriteria) {
        const optimization = {
            searchStrategy: {},
            platforms: [],
            keywords: [],
            filters: {},
            timing: {},
            trackingRecommendations: []
        };
        
        // Search strategy
        optimization.searchStrategy = {
            primary: 'SAM.gov advanced search with NAICS and agency filters',
            secondary: 'FedBizOpps historical analysis',
            tertiary: 'Agency-specific forecast analysis',
            monitoring: 'Set up automated alerts for key opportunities'
        };
        
        // Platform recommendations
        optimization.platforms = [
            {
                name: 'SAM.gov',
                purpose: 'Primary federal opportunity search',
                features: ['Advanced filtering', 'Saved searches', 'Email alerts'],
                priority: 'high'
            },
            {
                name: 'FPDS-NG',
                purpose: 'Historical contract data analysis',
                features: ['Spending analysis', 'Vendor research', 'Trend identification'],
                priority: 'medium'
            },
            {
                name: 'Agency websites',
                purpose: 'Direct agency engagement',
                features: ['Forecast information', 'Industry days', 'Pre-solicitation notices'],
                priority: 'high'
            }
        ];
        
        // Optimized keywords
        optimization.keywords = this.generateSearchKeywords(searchCriteria);
        
        // Recommended filters
        optimization.filters = this.generateSearchFilters(searchCriteria);
        
        // Timing strategy
        optimization.timing = this.generateTimingStrategy();
        
        return optimization;
    }


    /**
     * Enhanced query classification methods for both markets
     */
    isNAICSQuery(query) {
        return /naics|industry code|sic code|business classification|size standard/i.test(query);
    }
    
    isUSSetAsideQuery(query) {
        return /set.?aside|8\(a\)|hubzone|wosb|vosb|sdvosb|small business|disadvantaged|veteran/i.test(query);
    }

    isCanadianSupplierQuery(query) {
        return /indigenous.*business|psib|quebec.*business|women.*owned.*enterprise|supplier.*diversity.*canada/i.test(query);
    }
    
    isFARQuery(query) {
        return /\bfar\b|federal acquisition regulation|compliance.*us|solicitation.*us|rfp.*us/i.test(query);
    }

    isPSPCQuery(query) {
        return /pspc|public.*services.*procurement|standing.*offer|supply.*arrangement|buyandsell/i.test(query);
    }
    
    isGSAQuery(query) {
        return /gsa|schedule|mas|multiple award|sin number|professional services schedule/i.test(query);
    }

    isStandingOfferQuery(query) {
        return /standing.*offer|supply.*arrangement|call.*up|pre.*qualified.*supplier/i.test(query);
    }
    
    isProcurementCycleQuery(query) {
        return /procurement cycle|acquisition timeline|fiscal year|budget cycle|planning phase/i.test(query);
    }
    
    isSearchOptimizationQuery(query) {
        return /search|find opportunities|sam\.gov|buyandsell|opportunity search|federal search/i.test(query);
    }

    isCrossMarketQuery(query) {
        return /cross.*border|both.*markets|us.*and.*canada|compare.*markets|north.*american|usmca/i.test(query);
    }

    /**
     * Helper methods for analysis components
     */
    assessFARApplicability(part, contractType, query) {
        // Implementation would assess how FAR section applies to specific context
        return {
            applicability: 'high',
            reason: `${part} directly applies to ${contractType} contracts`,
            keyPoints: ['Compliance requirements', 'Documentation needs', 'Process requirements']
        };
    }

    getKeyFARConsiderations(query, contractType) {
        return [
            'Ensure small business subcontracting plan if over $750K',
            'Follow proper source selection procedures',
            'Document technical evaluation basis',
            'Comply with wage determination requirements if applicable'
        ];
    }

    generateComplianceChecklist(query, contractType) {
        return [
            'Verify registration in SAM.gov',
            'Review applicable clauses and provisions',
            'Ensure past performance documentation',
            'Validate technical capability evidence',
            'Confirm pricing methodology compliance'
        ];
    }

    generateResponse(analysis, query) {
        let response = `Based on my federal contracting expertise, here's my analysis of "${query}":\n\n`;
        
        if (analysis.naics) {
            response += `**NAICS Code Analysis:**\n`;
            analysis.naics.forEach(code => {
                response += `- ${code.code}: ${code.title} (Size Standard: ${code.sizeStandard})\n`;
            });
            response += `\n`;
        }
        
        if (analysis.setAsides) {
            response += `**Set-Aside Opportunities:**\n`;
            if (analysis.setAsides.eligiblePrograms.length > 0) {
                response += `You appear eligible for: ${analysis.setAsides.eligiblePrograms.map(p => p.program).join(', ')}\n`;
            }
            response += `\n`;
        }
        
        if (analysis.gsa) {
            response += `**GSA Schedule Guidance:**\n`;
            response += `Relevant schedules identified: ${analysis.gsa.relevantSchedules.length}\n\n`;
        }
        
        return response;
    }

    generateResources(analysis) {
        const resources = [
            {
                title: 'SAM.gov - System for Award Management',
                url: 'https://sam.gov',
                description: 'Primary federal contracting opportunity search platform'
            },
            {
                title: 'Acquisition.gov - FAR Regulations',
                url: 'https://acquisition.gov',
                description: 'Complete Federal Acquisition Regulation'
            },
            {
                title: 'SBA.gov - Small Business Administration',
                url: 'https://sba.gov',
                description: 'Small business certification and support programs'
            }
        ];
        
        return resources;
    }

    generateNextSteps(analysis, userProfile) {
        const steps = [
            'Register or update your SAM.gov profile',
            'Research specific agencies aligned with your capabilities',
            'Develop capability statements for target opportunities',
            'Build relationships through industry days and networking events'
        ];
        
        if (analysis.naics && analysis.naics.length > 0) {
            steps.unshift(`Consider certification for relevant set-asides under NAICS ${analysis.naics[0].code}`);
        }
        
        return steps;
    }

    /**
     * Generate comprehensive response for North American federal markets
     */
    generateNorthAmericanResponse(analysis, query, targetMarket) {
        let response = `Based on my North American federal contracting expertise for "${query}":\n\n`;
        
        // Market-specific intro
        if (targetMarket === 'both') {
            response += `**Cross-Market Analysis (US & Canada):**\n`;
        } else if (targetMarket === 'canada') {
            response += `**Canadian Federal Market Analysis:**\n`;
        } else {
            response += `**US Federal Market Analysis:**\n`;
        }
        
        // NAICS analysis
        if (analysis.naics) {
            response += `\n**NAICS Code Analysis:**\n`;
            analysis.naics.relevantCodes.slice(0, 3).forEach(code => {
                response += `- ${code.code}: ${code.title} (${code.market.toUpperCase()})\n`;
                if (code.opportunities.length > 0) {
                    response += `  Opportunities: ${code.opportunities.slice(0, 2).map(opp => opp.type).join(', ')}\n`;
                }
            });
            
            if (analysis.naics.crossMarketComparison) {
                response += `\n**Cross-Market Comparison:**\n`;
                response += `Common codes identified: ${analysis.naics.crossMarketComparison.commonCodes.length}\n`;
            }
        }
        
        // US Set-aside analysis
        if (analysis.usSetAsides?.eligiblePrograms?.length > 0) {
            response += `\n**US Set-Aside Eligibility:**\n`;
            analysis.usSetAsides.eligiblePrograms.forEach(program => {
                response += `- ${program.program}: ${program.description}\n`;
            });
        }
        
        // Canadian supplier diversity
        if (analysis.canadianSupplier?.eligiblePrograms?.length > 0) {
            response += `\n**Canadian Supplier Diversity Programs:**\n`;
            analysis.canadianSupplier.eligiblePrograms.forEach(program => {
                response += `- ${program.name}: ${program.description}\n`;
            });
        }
        
        // Cross-market recommendations
        if (analysis.crossMarket) {
            response += `\n**Cross-Market Strategy:**\n`;
            response += `Market opportunity: ${analysis.crossMarket.marketOverview.us.marketSize} (US) vs ${analysis.crossMarket.marketOverview.canada.marketSize} (Canada)\n`;
        }
        
        return response;
    }
    
    /**
     * Generate market-focused resources
     */
    generateNorthAmericanResources(analysis, targetMarket) {
        const resources = [];
        
        // US market resources
        if (targetMarket === 'us') {
            resources.push(
                {
                    title: 'SAM.gov - US Federal Opportunities',
                    url: 'https://sam.gov',
                    description: 'Primary US federal contracting platform for registration and opportunity search'
                },
                {
                    title: 'GSA.gov - General Services Administration',
                    url: 'https://gsa.gov',
                    description: 'GSA schedules, MAS contracts, and federal acquisition resources'
                },
                {
                    title: 'SBA.gov - Small Business Programs',
                    url: 'https://sba.gov',
                    description: 'US small business certifications, resources, and contracting support'
                },
                {
                    title: 'Acquisition.gov - Federal Acquisition Regulation',
                    url: 'https://acquisition.gov',
                    description: 'Complete FAR regulations and federal acquisition policies'
                }
            );
        }
        
        // Canadian market resources
        else if (targetMarket === 'canada') {
            resources.push(
                {
                    title: 'BuyandSell.gc.ca - Canadian Federal Procurement',
                    url: 'https://buyandsell.gc.ca',
                    description: 'Primary Canadian federal procurement platform for tenders and supplier registration'
                },
                {
                    title: 'PSPC Procurement - Public Services and Procurement Canada',
                    url: 'https://pspc-spac.gc.ca',
                    description: 'Canadian federal procurement policies, methods, and supplier resources'
                },
                {
                    title: 'Indigenous Services Canada - PSIB',
                    url: 'https://sac-isc.gc.ca',
                    description: 'Procurement Strategy for Indigenous Business (5% federal target)'
                },
                {
                    title: 'Canadian Council for Indigenous Business',
                    url: 'https://ccib.com',
                    description: 'Indigenous business certification and support services'
                }
            );
        }
        
        // Cross-market resources (only when explicitly requested)
        else if (targetMarket === 'both') {
            // Include both market resources plus cross-market specific
            resources.push(
                {
                    title: 'SAM.gov - US Federal Opportunities',
                    url: 'https://sam.gov',
                    description: 'Primary US federal contracting platform'
                },
                {
                    title: 'BuyandSell.gc.ca - Canadian Federal Procurement',
                    url: 'https://buyandsell.gc.ca',
                    description: 'Primary Canadian federal procurement platform'
                },
                {
                    title: 'USMCA Trade Agreement',
                    url: 'https://ustr.gov/trade-agreements/free-trade-agreements/united-states-mexico-canada-agreement',
                    description: 'Cross-border trade and procurement provisions between US, Mexico, and Canada'
                },
                {
                    title: 'Export.gov - Market Intelligence',
                    url: 'https://export.gov',
                    description: 'US trade and export resources for international market entry'
                }
            );
        }
        
        return resources;
    }
    
    /**
     * Generate market-specific next steps
     */
    generateNorthAmericanNextSteps(analysis, userProfile, targetMarket) {
        const steps = [];
        
        if (targetMarket === 'us' || targetMarket === 'both') {
            steps.push(
                'Register or update SAM.gov profile with current certifications',
                'Research GSA schedule opportunities in your NAICS codes'
            );
            
            if (analysis.usSetAsides?.eligiblePrograms?.length > 0) {
                steps.push('Leverage your existing US certifications for set-aside opportunities');
            } else {
                steps.push('Consider pursuing relevant US small business certifications');
            }
        }
        
        if (targetMarket === 'canada' || targetMarket === 'both') {
            steps.push(
                'Create supplier profile on BuyandSell.gc.ca',
                'Research standing offer opportunities in your service areas'
            );
            
            if (userProfile.location?.country !== 'canada') {
                steps.push('Consider establishing Canadian business presence or partnerships');
            }
            
            steps.push('Evaluate eligibility for Canadian supplier diversity programs');
        }
        
        if (targetMarket === 'both') {
            steps.push(
                'Develop cross-market capability statements highlighting both jurisdictions',
                'Consider joint venture partnerships for expanded market access',
                'Research USMCA benefits for your business sector'
            );
        }
        
        return steps;
    }
    /**
     * Helper methods for Canadian market analysis
     */
    assessCanadianProgramEligibility(program, userProfile) {
        return {
            potentialEligibility: true,
            requirements: program.eligibility || 'Review specific program requirements',
            advantages: program.advantages || [],
            nextSteps: ['Verify eligibility criteria', 'Gather required documentation']
        };
    }
    
    assessCanadianMarketOpportunity(program, query) {
        return {
            marketSize: 'Significant opportunity in Canadian federal market',
            competition: 'Moderate',
            barriers: 'Language and regulatory compliance',
            potential: 'High for qualified suppliers'
        };
    }
    
    generateCanadianSupplierRecommendations(eligiblePrograms) {
        return eligiblePrograms.map(program => ({
            type: 'certification',
            program: program.name,
            description: `Consider pursuing ${program.name} certification`,
            priority: 'high',
            market: 'canada'
        }));
    }
    
    /**
     * Cross-market comparison helper methods
     */
    identifyCodeDifferences(usCode, canadaCode) {
        return {
            sizeStandards: {
                us: usCode.sizeStandard,
                canada: canadaCode.sizeStandard
            },
            programs: {
                us: usCode.commonSetAsides || [],
                canada: canadaCode.commonPrograms || []
            },
            advantages: 'Cross-market presence enables broader opportunities'
        };
    }
    
    compareSizeStandards(usCodes, canadaCodes) {
        return {
            us: 'Revenue-based size standards ($1M-$47M typically)',
            canada: 'Employee-based size standards (<100-500 employees)',
            implications: 'Companies may qualify differently in each market'
        };
    }
    
    compareSupplierPrograms() {
        return {
            us: ['8(a)', 'HUBZone', 'WOSB', 'VOSB', 'SDVOSB'],
            canada: ['Indigenous Business (5% target)', 'Women-owned Enterprise', 'Quebec Business'],
            opportunities: 'Different certification pathways offer distinct competitive advantages'
        };
    }
    
    compareProcurementMethods() {
        return {
            us: ['GSA Schedules', 'SEWP', 'CIO-SP3', 'Professional Services Schedule'],
            canada: ['Standing Offers', 'Supply Arrangements', 'PSPC Methods'],
            strategy: 'Pre-qualification in both markets maximizes opportunity access'
        };
    }
    
    generateCrossMarketStrategy(commonCodes) {
        const strategies = [];
        
        if (commonCodes.length > 0) {
            strategies.push({
                strategy: 'dual_market_presence',
                description: 'Establish qualified vendor status in both markets',
                benefits: ['Broader opportunity access', 'Risk diversification', 'Economies of scale'],
                considerations: ['Regulatory compliance', 'Resource allocation', 'Market entry costs']
            });
        }
        
        strategies.push({
            strategy: 'partnership_approach',
            description: 'Partner with local firms for market-specific advantages',
            benefits: ['Local market knowledge', 'Established relationships', 'Compliance support'],
            considerations: ['Partnership agreements', 'Revenue sharing', 'Relationship management']
        });
        
        return strategies;
    }
    
    /**
     * PSPC analysis helper methods
     */
    assessProcurementMethodRelevance(method, query) {
        const queryWords = query.toLowerCase().split(' ');
        const methodKeywords = method.description.toLowerCase().split(' ');
        const commonWords = queryWords.filter(word => methodKeywords.includes(word));
        return commonWords.length / queryWords.length;
    }
    
    assessMethodSuitability(method, userProfile) {
        return {
            suitability: 'good',
            reasons: ['Matches business profile', 'Appropriate complexity level'],
            requirements: method.characteristics || []
        };
    }
    
    identifyStandingOfferOpportunities(query, userProfile) {
        return [{
            type: 'standing_offer',
            description: 'Pre-qualified supplier opportunities',
            callUpLimits: this.pspcProcurementMethods.standing_offers.callUpLimits,
            advantages: this.pspcProcurementMethods.standing_offers.advantages
        }];
    }
    
    /**
     * Cross-market opportunity comparison
     */
    compareOpportunitiesAcrossMarkets(query, userProfile) {
        return {
            us: {
                volume: 'High volume, high competition',
                advantages: ['Large market size', 'Established processes', 'Multiple agencies'],
                challenges: ['High competition', 'Complex regulations', 'Long sales cycles']
            },
            canada: {
                volume: 'Moderate volume, targeted opportunities',
                advantages: ['Less competition', 'Supplier diversity focus', 'Growing Indigenous market'],
                challenges: ['Smaller market', 'Language requirements', 'Trade agreement compliance']
            }
        };
    }
    
    generateMarketEntryStrategies(userProfile) {
        return {
            direct_entry: {
                description: 'Direct market entry with local business registration',
                suitability: 'Established companies with resources for expansion',
                timeline: '6-12 months',
                investment: 'High'
            },
            partnership: {
                description: 'Strategic partnerships with local firms',
                suitability: 'Companies seeking faster market entry',
                timeline: '3-6 months',
                investment: 'Medium'
            },
            joint_venture: {
                description: 'Joint ventures for specific opportunities',
                suitability: 'Project-specific or sector-specific entry',
                timeline: '2-4 months',
                investment: 'Low to Medium'
            }
        };
    }
    
    generateCrossMarketRecommendations(comparison) {
        return [
            {
                type: 'market_research',
                description: 'Conduct thorough analysis of target market regulations and requirements',
                priority: 'high',
                timeline: '1-2 months'
            },
            {
                type: 'compliance_preparation',
                description: 'Prepare for regulatory and certification requirements in target markets',
                priority: 'high',
                timeline: '2-4 months'
            },
            {
                type: 'relationship_building',
                description: 'Build relationships with agencies and potential partners in both markets',
                priority: 'medium',
                timeline: 'Ongoing'
            }
        ];
    }
    
    /**
     * Generate general North American federal guidance
     */
    generateGeneralNorthAmericanGuidance(query, userProfile, targetMarket) {
        const marketDescription = targetMarket === 'both' ? 'US and Canadian federal markets' :
                                 targetMarket === 'canada' ? 'Canadian federal market' :
                                 'US federal market';
        
        return {
            agentId: this.agentId,
            agentName: this.name,
            query,
            targetMarket,
            content: `For ${marketDescription} guidance on "${query}", I recommend starting with market research, understanding relevant NAICS codes, and reviewing applicable procurement regulations. Consider your certification options and contracting vehicle opportunities in your target market(s).`,
            recommendations: [
                'Conduct market research in target jurisdiction(s)',
                'Understand NAICS code implications across markets',
                'Review applicable procurement regulations (FAR/PSPC)',
                'Consider appropriate business certifications',
                'Explore pre-qualification opportunities (GSA/Standing Offers)'
            ],
            resources: this.generateNorthAmericanResources({}, targetMarket),
            nextSteps: this.generateNorthAmericanNextSteps({}, userProfile, targetMarket),
            confidence: 0.7
        };
    }
    
    /**
     * Additional helper methods for analysis
     */
    assessScheduleFit(scheduleInfo, userProfile) {
        return 'good'; // Simplified implementation
    }
    
    assessGSARequirements(userProfile) {
        return [
            '2+ years in business',
            'Commercial sales history',
            'Financial capability',
            'Past performance references'
        ];
    }
    
    generateGSANextSteps(schedules, userProfile) {
        return [
            'Review GSA Schedule requirements',
            'Prepare commercial pricing',
            'Gather past performance documentation',
            'Submit GSA Schedule application'
        ];
    }
    
    generateNAICSRecommendations(naicsAnalysis, targetMarket) {
        return [
            {
                type: 'naics_focus',
                description: `Focus on identified NAICS codes for ${targetMarket} market opportunities`,
                priority: 'high'
            }
        ];
    }
    
    generateSetAsideRecommendations(setAsideAnalysis) {
        return setAsideAnalysis.eligiblePrograms.map(program => ({
            type: 'certification',
            description: `Leverage ${program.program} certification for competitive advantage`,
            priority: 'high'
        }));
    }
    
    generateFARRecommendations(farAnalysis) {
        return [
            {
                type: 'compliance',
                description: 'Ensure FAR compliance for federal contracting',
                priority: 'high'
            }
        ];
    }
    
    generateGSARecommendations(gsaAnalysis) {
        return [
            {
                type: 'gsa_schedule',
                description: 'Consider GSA Schedule as a strategic contracting vehicle',
                priority: 'medium'
            }
        ];
    }
    
    generatePSPCRecommendations(pspcAnalysis) {
        return [
            {
                type: 'pspc_method',
                description: 'Explore appropriate PSPC procurement methods for your services',
                priority: 'medium'
            }
        ];
    }
    
    generateStandingOfferRecommendations(standingOfferAnalysis) {
        return [
            {
                type: 'standing_offer',
                description: 'Pursue standing offer pre-qualification opportunities',
                priority: 'medium'
            }
        ];
    }
    
    analyzeStandingOffers(query, userProfile) {
        return {
            opportunities: [
                {
                    type: 'standing_offer',
                    description: 'Pre-qualified supplier opportunities in Canadian federal market',
                    callUpLimits: this.pspcProcurementMethods.standing_offers.callUpLimits,
                    advantages: this.pspcProcurementMethods.standing_offers.advantages
                }
            ],
            eligibility: 'Review specific standing offer requirements',
            nextSteps: [
                'Research relevant standing offer opportunities',
                'Prepare qualification documentation',
                'Submit standing offer application'
            ]
        };
    }
}

module.exports = NorthAmericanFederalAgent;