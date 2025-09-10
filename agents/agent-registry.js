const agentRegistry = {
  // Domain Agents - Subject matter expertise
  federal: {
    name: 'Federal Domain Agent',
    type: 'domain',
    scope: 'federal',
    expertise: ['federal contracting', 'federal agencies', 'federal compliance', 'federal regulations'],
    capabilities: [
      'federal_acquisition_regulations_guidance',
      'federal_agency_analysis',
      'federal_opportunity_evaluation',
      'compliance_requirement_interpretation',
      'federal_market_intelligence'
    ],
    description: 'Provides expertise in federal contracting, regulations, and market intelligence',
    priority: 'high',
    status: 'active',
    triggers: ['federal', 'FAR', 'agency', 'compliance', 'regulation'],
    callCount: 0,
    lastActive: null
  },

  sled: {
    name: 'SLED Domain Agent',
    type: 'domain',
    scope: 'sled',
    expertise: ['state government', 'local government', 'education', 'SLED contracting'],
    capabilities: [
      'state_local_procurement_processes',
      'education_sector_opportunities',
      'sled_compliance_requirements',
      'regional_market_analysis',
      'sled_relationship_mapping'
    ],
    description: 'Specializes in State, Local, and Education (SLED) government contracting',
    priority: 'high',
    status: 'active',
    triggers: ['sled', 'state', 'local', 'education', 'municipal'],
    callCount: 0,
    lastActive: null
  },

  contractIntelligence: {
    name: 'Contract Intelligence Agent',
    type: 'domain',
    scope: 'contracts',
    expertise: ['contract analysis', 'pricing strategies', 'terms evaluation', 'risk assessment'],
    capabilities: [
      'contract_term_analysis',
      'pricing_strategy_recommendations',
      'risk_identification_mitigation',
      'performance_metrics_evaluation',
      'contract_lifecycle_management'
    ],
    description: 'Provides intelligent contract analysis and strategic pricing guidance',
    priority: 'high',
    status: 'active',
    triggers: ['contract', 'pricing', 'terms', 'risk', 'analysis'],
    callCount: 0,
    lastActive: null
  },

  relationshipManagement: {
    name: 'Relationship Management Agent',
    type: 'domain',
    scope: 'relationships',
    expertise: ['stakeholder mapping', 'relationship tracking', 'contact management', 'networking'],
    capabilities: [
      'stakeholder_identification_mapping',
      'relationship_strength_assessment',
      'contact_management_strategies',
      'networking_opportunity_identification',
      'relationship_development_planning'
    ],
    description: 'Manages stakeholder relationships and networking opportunities',
    priority: 'medium',
    status: 'active',
    triggers: ['relationship', 'stakeholder', 'contact', 'network'],
    callCount: 0,
    lastActive: null
  },

  technicalSupport: {
    name: 'Technical Support Agent',
    type: 'domain',
    scope: 'support',
    expertise: ['platform usage', 'troubleshooting', 'feature guidance', 'training'],
    capabilities: [
      'platform_navigation_assistance',
      'feature_explanation_guidance',
      'troubleshooting_common_issues',
      'training_resource_recommendations',
      'user_onboarding_support'
    ],
    description: 'Provides technical support and platform guidance to users',
    priority: 'medium',
    status: 'active',
    triggers: ['help', 'support', 'how to', 'tutorial', 'training'],
    callCount: 0,
    lastActive: null
  },

  // Workflow Agents - Process and task management
  searchOrchestrator: {
    name: 'Search Orchestrator Agent',
    type: 'workflow',
    scope: 'search',
    expertise: ['search coordination', 'query routing', 'result aggregation', 'search optimization'],
    capabilities: [
      'multi_source_search_coordination',
      'query_interpretation_routing',
      'result_ranking_aggregation',
      'search_strategy_optimization',
      'domain_specific_search_delegation'
    ],
    description: 'Coordinates and optimizes search across multiple data sources',
    priority: 'critical',
    status: 'active',
    triggers: ['search', 'find', 'lookup', 'query'],
    callCount: 0,
    lastActive: null
  },

  alertManager: {
    name: 'Alert Manager Agent',
    type: 'workflow',
    scope: 'alerts',
    expertise: ['alert configuration', 'notification management', 'priority assessment', 'delivery optimization'],
    capabilities: [
      'alert_rule_configuration_management',
      'notification_priority_assessment',
      'multi_channel_alert_delivery',
      'alert_fatigue_prevention',
      'custom_alert_creation'
    ],
    description: 'Manages alerts, notifications, and priority-based delivery systems',
    priority: 'high',
    status: 'active',
    triggers: ['alert', 'notification', 'notify', 'reminder'],
    callCount: 0,
    lastActive: null
  },

  reportGenerator: {
    name: 'Report Generator Agent',
    type: 'workflow',
    scope: 'reporting',
    expertise: ['report creation', 'data visualization', 'analytics', 'export formats'],
    capabilities: [
      'custom_report_generation',
      'data_analysis_visualization',
      'multi_format_export',
      'scheduled_report_delivery',
      'interactive_dashboard_creation'
    ],
    description: 'Generates custom reports, visualizations, and analytics dashboards',
    priority: 'medium',
    status: 'active',
    triggers: ['report', 'export', 'analytics', 'dashboard'],
    callCount: 0,
    lastActive: null
  },

  opportunityTracker: {
    name: 'Opportunity Tracker Agent',
    type: 'workflow',
    scope: 'opportunities',
    expertise: ['opportunity monitoring', 'pipeline management', 'deadline tracking', 'progress assessment'],
    capabilities: [
      'opportunity_lifecycle_tracking',
      'pipeline_stage_management',
      'deadline_milestone_monitoring',
      'progress_assessment_reporting',
      'opportunity_scoring_prioritization'
    ],
    description: 'Tracks opportunities through their lifecycle and manages pipeline progression',
    priority: 'high',
    status: 'active',
    triggers: ['opportunity', 'pipeline', 'track', 'deadline'],
    callCount: 0,
    lastActive: null
  },

  marketResearcher: {
    name: 'Market Researcher Agent',
    type: 'workflow',
    scope: 'research',
    expertise: ['market analysis', 'trend identification', 'competitive intelligence', 'industry insights'],
    capabilities: [
      'market_trend_analysis',
      'competitive_landscape_assessment',
      'industry_insight_generation',
      'market_opportunity_identification',
      'strategic_intelligence_gathering'
    ],
    description: 'Conducts market research and provides competitive intelligence',
    priority: 'medium',
    status: 'active',
    triggers: ['market', 'research', 'competitive', 'intelligence'],
    callCount: 0,
    lastActive: null
  },

  // Legacy agents maintained for backward compatibility
  searchAssistant: {
    name: 'Search Assistant',
    type: 'search',
    capabilities: [
      'knowledge_base_search',
      'document_retrieval',
      'content_summarization',
      'query_understanding'
    ],
    description: 'Helps users search and retrieve information from the GovWin IQ knowledge base',
    priority: 1,
    active: true,
    triggers: [
      'search',
      'find',
      'lookup',
      'information',
      'knowledge'
    ]
  },

  conversationManager: {
    name: 'Conversation Manager',
    type: 'orchestration',
    capabilities: [
      'conversation_flow_control',
      'context_management',
      'agent_coordination',
      'user_intent_routing'
    ],
    description: 'Manages conversation flow and coordinates between different specialized agents',
    priority: 0,
    active: true,
    triggers: [
      'help',
      'start',
      'menu',
      'options'
    ]
  },

  govwinExpert: {
    name: 'GovWin IQ Expert',
    type: 'domain_expert',
    capabilities: [
      'govwin_specific_guidance',
      'feature_explanations',
      'best_practices',
      'troubleshooting'
    ],
    description: 'Provides expert guidance on GovWin IQ features, functionality, and best practices',
    priority: 2,
    active: true,
    triggers: [
      'govwin',
      'feature',
      'how to',
      'tutorial',
      'guide'
    ]
  },

  customerSupport: {
    name: 'Customer Support',
    type: 'support',
    capabilities: [
      'issue_resolution',
      'ticket_creation',
      'escalation_handling',
      'status_updates'
    ],
    description: 'Handles customer support requests, issues, and escalations',
    priority: 3,
    active: true,
    triggers: [
      'problem',
      'issue',
      'bug',
      'error',
      'support'
    ]
  },

  onboardingAssistant: {
    name: 'Onboarding Assistant',
    type: 'onboarding',
    capabilities: [
      'new_user_guidance',
      'setup_assistance',
      'initial_configuration',
      'getting_started'
    ],
    description: 'Guides new users through initial setup and getting started with GovWin IQ',
    priority: 4,
    active: true,
    triggers: [
      'new',
      'setup',
      'getting started',
      'onboard',
      'welcome'
    ]
  },

  analyticsAgent: {
    name: 'Analytics Agent',
    type: 'analytics',
    capabilities: [
      'usage_tracking',
      'performance_metrics',
      'conversation_analytics',
      'user_behavior_analysis'
    ],
    description: 'Tracks and analyzes chatbot performance and user interactions',
    priority: 5,
    active: true,
    triggers: []
  }
};

// Utility functions for agent registry operations
const getAgentByType = (type) => {
  return Object.values(agentRegistry).find(agent => agent.type === type);
};

const getAgentsByType = (type) => {
  return Object.values(agentRegistry).filter(agent => agent.type === type);
};

const getAgentsByScope = (scope) => {
  return Object.values(agentRegistry).filter(agent => agent.scope === scope);
};

const getAgentsByPriority = (priority) => {
  return Object.values(agentRegistry).filter(agent => agent.priority === priority);
};

const getAgentsByCapability = (capability) => {
  return Object.values(agentRegistry).filter(agent => 
    agent.capabilities && agent.capabilities.includes(capability)
  );
};

const getDomainAgents = () => {
  return getAgentsByType('domain');
};

const getWorkflowAgents = () => {
  return getAgentsByType('workflow');
};

const getActiveAgents = () => {
  return Object.values(agentRegistry)
    .filter(agent => agent.active || agent.status === 'active')
    .sort((a, b) => {
      if (a.priority === 'critical') return -1;
      if (b.priority === 'critical') return 1;
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (b.priority === 'high' && a.priority !== 'high') return 1;
      if (a.priority === 'medium' && b.priority === 'low') return -1;
      if (b.priority === 'medium' && a.priority === 'low') return 1;
      return (a.priority || 999) - (b.priority || 999);
    });
};

const findAgentByExpertise = (expertise) => {
  return Object.values(agentRegistry).find(agent => 
    agent.expertise && agent.expertise.some(exp => 
      exp.toLowerCase().includes(expertise.toLowerCase())
    )
  );
};

const findAgentsByCapability = (capability) => {
  return Object.values(agentRegistry).filter(agent => 
    agent.capabilities && agent.capabilities.some(cap => 
      cap.toLowerCase().includes(capability.toLowerCase())
    )
  );
};

const matchAgentByTrigger = (userInput) => {
  const input = userInput.toLowerCase();
  
  for (const [key, agent] of Object.entries(agentRegistry)) {
    if (!agent.active && agent.status !== 'active') continue;
    if (!agent.triggers) continue;
    
    for (const trigger of agent.triggers) {
      if (input.includes(trigger.toLowerCase())) {
        return { key, agent };
      }
    }
  }
  
  return null;
};

const updateAgentActivity = (agentKey) => {
  const agent = agentRegistry[agentKey];
  if (agent) {
    agent.lastActive = new Date();
    agent.callCount = (agent.callCount || 0) + 1;
  }
};

const updateAgentStatus = (agentKey, status) => {
  const agent = agentRegistry[agentKey];
  if (agent) {
    agent.status = status;
  }
};

const getAgentStats = () => {
  const agents = Object.values(agentRegistry);
  return {
    total: agents.length,
    active: agents.filter(a => a.active || a.status === 'active').length,
    domain: getDomainAgents().length,
    workflow: getWorkflowAgents().length,
    byPriority: {
      critical: getAgentsByPriority('critical').length,
      high: getAgentsByPriority('high').length,
      medium: getAgentsByPriority('medium').length,
      low: getAgentsByPriority('low').length
    }
  };
};

const getAgentCapabilities = (agentKey) => {
  return agentRegistry[agentKey]?.capabilities || [];
};

const isAgentActive = (agentKey) => {
  const agent = agentRegistry[agentKey];
  return agent?.active || agent?.status === 'active' || false;
};

const getAllAgents = () => {
  return agentRegistry;
};

const listAgents = () => {
  const agents = Object.values(agentRegistry);
  return agents.map(agent => ({
    id: agent.id || Object.keys(agentRegistry).find(key => agentRegistry[key] === agent),
    name: agent.name,
    type: agent.type,
    scope: agent.scope,
    priority: agent.priority,
    status: agent.status || (agent.active ? 'active' : 'inactive'),
    expertise: agent.expertise,
    callCount: agent.callCount || 0,
    lastActive: agent.lastActive
  }));
};

const getAgentMetadata = (agentKey) => {
  const agent = agentRegistry[agentKey];
  if (!agent) return null;
  
  return {
    name: agent.name,
    type: agent.type,
    scope: agent.scope,
    description: agent.description,
    capabilities: agent.capabilities,
    expertise: agent.expertise,
    priority: agent.priority,
    active: agent.active || agent.status === 'active',
    triggerCount: agent.triggers ? agent.triggers.length : 0,
    callCount: agent.callCount || 0,
    lastActive: agent.lastActive
  };
};

// Export all functions and the registry
module.exports = {
  agentRegistry,
  getAgentByType,
  getAgentsByType,
  getAgentsByScope,
  getAgentsByPriority,
  getAgentsByCapability,
  getDomainAgents,
  getWorkflowAgents,
  getActiveAgents,
  findAgentByExpertise,
  findAgentsByCapability,
  matchAgentByTrigger,
  updateAgentActivity,
  updateAgentStatus,
  getAgentStats,
  getAgentCapabilities,
  isAgentActive,
  getAllAgents,
  listAgents,
  getAgentMetadata
};