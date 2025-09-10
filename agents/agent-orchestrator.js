/**
 * GovWin IQ Agent Orchestrator
 * 
 * Manages complex multi-agent workflows including:
 * - Sequential execution (one agent after another)
 * - Parallel execution (multiple agents simultaneously)
 * - Conditional execution (agents based on conditions)
 * - Pipeline execution (data flows between agents)
 * - Event-driven workflows
 */

const { agentRegistry, updateAgentActivity } = require('./agent-registry');
const { intentRouter } = require('./intent-router');

// Workflow execution patterns
const ExecutionPatterns = {
    SEQUENTIAL: 'sequential',
    PARALLEL: 'parallel',
    CONDITIONAL: 'conditional',
    PIPELINE: 'pipeline',
    EVENT_DRIVEN: 'event_driven',
    HYBRID: 'hybrid'
};

// Workflow states
const WorkflowStates = {
    PENDING: 'pending',
    RUNNING: 'running',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    PAUSED: 'paused'
};

// Agent execution states
const AgentStates = {
    QUEUED: 'queued',
    RUNNING: 'running',
    COMPLETED: 'completed',
    FAILED: 'failed',
    SKIPPED: 'skipped',
    WAITING: 'waiting'
};

class AgentOrchestrator {
    constructor() {
        this.workflows = new Map();
        this.activeWorkflows = new Map();
        this.workflowHistory = [];
        this.eventBus = new Map(); // Simple event system
        this.maxConcurrentWorkflows = 10;
        this.defaultTimeout = 30000; // 30 seconds
        
        this.initializePresetWorkflows();
    }

    /**
     * Initialize common preset workflows
     */
    initializePresetWorkflows() {
        // Federal Opportunity Analysis Workflow
        this.registerWorkflow('federal-opportunity-analysis', {
            name: 'Federal Opportunity Analysis',
            description: 'Comprehensive analysis of federal contracting opportunities',
            pattern: ExecutionPatterns.SEQUENTIAL,
            steps: [
                {
                    id: 'search',
                    agent: 'searchOrchestrator',
                    action: 'search_opportunities',
                    timeout: 15000
                },
                {
                    id: 'federal_analysis',
                    agent: 'federal',
                    action: 'analyze_opportunity',
                    dependencies: ['search'],
                    timeout: 20000
                },
                {
                    id: 'contract_analysis',
                    agent: 'contractIntelligence',
                    action: 'analyze_terms',
                    dependencies: ['federal_analysis'],
                    timeout: 15000
                },
                {
                    id: 'generate_report',
                    agent: 'reportGenerator',
                    action: 'create_analysis_report',
                    dependencies: ['contract_analysis'],
                    timeout: 10000
                }
            ]
        });

        // SLED Market Research Workflow
        this.registerWorkflow('sled-market-research', {
            name: 'SLED Market Research',
            description: 'State, Local, Education market research and opportunity identification',
            pattern: ExecutionPatterns.PARALLEL,
            steps: [
                {
                    id: 'sled_analysis',
                    agent: 'sled',
                    action: 'analyze_market',
                    parallel_group: 'analysis'
                },
                {
                    id: 'market_research',
                    agent: 'marketResearcher',
                    action: 'research_trends',
                    parallel_group: 'analysis'
                },
                {
                    id: 'relationship_mapping',
                    agent: 'relationshipManagement',
                    action: 'map_stakeholders',
                    parallel_group: 'analysis'
                },
                {
                    id: 'compile_results',
                    agent: 'reportGenerator',
                    action: 'compile_market_report',
                    dependencies: ['sled_analysis', 'market_research', 'relationship_mapping']
                }
            ]
        });

        // Alert and Notification Workflow
        this.registerWorkflow('alert-notification-pipeline', {
            name: 'Alert and Notification Pipeline',
            description: 'Processes and delivers alerts with appropriate prioritization',
            pattern: ExecutionPatterns.PIPELINE,
            steps: [
                {
                    id: 'alert_processing',
                    agent: 'alertManager',
                    action: 'process_alert',
                    output_transform: 'priority_assessment'
                },
                {
                    id: 'opportunity_check',
                    agent: 'opportunityTracker',
                    action: 'check_relevance',
                    condition: (context) => context.alert_type === 'opportunity',
                    input_transform: 'alert_to_opportunity'
                },
                {
                    id: 'notification_delivery',
                    agent: 'alertManager',
                    action: 'deliver_notification',
                    dependencies: ['alert_processing']
                }
            ]
        });

        // Comprehensive Search Workflow
        this.registerWorkflow('comprehensive-search', {
            name: 'Comprehensive Search',
            description: 'Multi-domain search with intelligent routing',
            pattern: ExecutionPatterns.CONDITIONAL,
            steps: [
                {
                    id: 'initial_search',
                    agent: 'searchOrchestrator',
                    action: 'perform_search'
                },
                {
                    id: 'federal_deep_dive',
                    agent: 'federal',
                    action: 'detailed_analysis',
                    condition: (context) => context.domain_detected === 'federal',
                    dependencies: ['initial_search']
                },
                {
                    id: 'sled_deep_dive',
                    agent: 'sled',
                    action: 'detailed_analysis',
                    condition: (context) => context.domain_detected === 'sled',
                    dependencies: ['initial_search']
                },
                {
                    id: 'contract_review',
                    agent: 'contractIntelligence',
                    action: 'review_contracts',
                    condition: (context) => context.contracts_found > 0,
                    dependencies: ['initial_search']
                },
                {
                    id: 'consolidate_results',
                    agent: 'searchOrchestrator',
                    action: 'consolidate_results',
                    dependencies: ['initial_search'],
                    wait_for_any: ['federal_deep_dive', 'sled_deep_dive', 'contract_review']
                }
            ]
        });
    }

    /**
     * Register a new workflow
     */
    registerWorkflow(id, config) {
        const workflow = {
            id,
            ...config,
            registeredAt: new Date(),
            version: config.version || '1.0.0',
            enabled: config.enabled !== false
        };

        this.workflows.set(id, workflow);
        return workflow;
    }

    /**
     * Execute a workflow
     */
    async executeWorkflow(workflowId, context = {}, options = {}) {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            throw new Error(`Workflow ${workflowId} not found`);
        }

        if (!workflow.enabled) {
            throw new Error(`Workflow ${workflowId} is disabled`);
        }

        if (this.activeWorkflows.size >= this.maxConcurrentWorkflows) {
            throw new Error('Maximum concurrent workflows reached');
        }

        const executionId = this.generateExecutionId();
        const execution = {
            id: executionId,
            workflowId,
            workflow,
            context: { ...context },
            options: { 
                timeout: options.timeout || this.defaultTimeout,
                retryCount: options.retryCount || 0,
                maxRetries: options.maxRetries || 2,
                ...options 
            },
            state: WorkflowStates.PENDING,
            startTime: new Date(),
            steps: this.initializeSteps(workflow.steps),
            results: {},
            errors: [],
            metrics: {
                totalSteps: workflow.steps.length,
                completedSteps: 0,
                failedSteps: 0,
                skippedSteps: 0
            }
        };

        this.activeWorkflows.set(executionId, execution);

        try {
            execution.state = WorkflowStates.RUNNING;
            
            let result;
            switch (workflow.pattern) {
                case ExecutionPatterns.SEQUENTIAL:
                    result = await this.executeSequential(execution);
                    break;
                case ExecutionPatterns.PARALLEL:
                    result = await this.executeParallel(execution);
                    break;
                case ExecutionPatterns.CONDITIONAL:
                    result = await this.executeConditional(execution);
                    break;
                case ExecutionPatterns.PIPELINE:
                    result = await this.executePipeline(execution);
                    break;
                case ExecutionPatterns.EVENT_DRIVEN:
                    result = await this.executeEventDriven(execution);
                    break;
                case ExecutionPatterns.HYBRID:
                    result = await this.executeHybrid(execution);
                    break;
                default:
                    throw new Error(`Unknown execution pattern: ${workflow.pattern}`);
            }

            execution.state = WorkflowStates.COMPLETED;
            execution.endTime = new Date();
            execution.duration = execution.endTime - execution.startTime;
            execution.finalResult = result;

            this.recordWorkflowExecution(execution);
            return result;

        } catch (error) {
            execution.state = WorkflowStates.FAILED;
            execution.endTime = new Date();
            execution.duration = execution.endTime - execution.startTime;
            execution.error = error;
            execution.errors.push({
                timestamp: new Date(),
                error: error.message,
                stack: error.stack
            });

            this.recordWorkflowExecution(execution);
            throw error;

        } finally {
            this.activeWorkflows.delete(executionId);
        }
    }

    /**
     * Execute sequential workflow
     */
    async executeSequential(execution) {
        const results = {};
        
        for (const step of execution.workflow.steps) {
            if (this.shouldSkipStep(step, execution.context, results)) {
                execution.steps.get(step.id).state = AgentStates.SKIPPED;
                execution.metrics.skippedSteps++;
                continue;
            }

            try {
                execution.steps.get(step.id).state = AgentStates.RUNNING;
                execution.steps.get(step.id).startTime = new Date();

                const stepResult = await this.executeStep(step, execution.context, results);
                
                results[step.id] = stepResult;
                execution.results[step.id] = stepResult;
                execution.steps.get(step.id).result = stepResult;
                execution.steps.get(step.id).state = AgentStates.COMPLETED;
                execution.steps.get(step.id).endTime = new Date();
                execution.metrics.completedSteps++;

                // Update context for next steps
                if (step.output_transform) {
                    execution.context = this.transformContext(execution.context, stepResult, step.output_transform);
                }

            } catch (error) {
                execution.steps.get(step.id).state = AgentStates.FAILED;
                execution.steps.get(step.id).error = error;
                execution.steps.get(step.id).endTime = new Date();
                execution.metrics.failedSteps++;

                if (step.required !== false) {
                    throw error;
                }
            }
        }

        return results;
    }

    /**
     * Execute parallel workflow
     */
    async executeParallel(execution) {
        const parallelGroups = this.groupStepsByParallelGroup(execution.workflow.steps);
        const results = {};

        for (const [groupName, steps] of parallelGroups) {
            if (groupName === 'sequential') {
                // Execute sequential steps one by one
                for (const step of steps) {
                    if (this.areDependenciesSatisfied(step, results)) {
                        const stepResult = await this.executeStepWithMetrics(step, execution, results);
                        if (stepResult !== null) {
                            results[step.id] = stepResult;
                        }
                    }
                }
            } else {
                // Execute parallel steps simultaneously
                const promises = steps
                    .filter(step => this.areDependenciesSatisfied(step, results))
                    .map(step => this.executeStepWithMetrics(step, execution, results));

                const parallelResults = await Promise.allSettled(promises);
                
                parallelResults.forEach((result, index) => {
                    const step = steps[index];
                    if (result.status === 'fulfilled' && result.value !== null) {
                        results[step.id] = result.value;
                    }
                });
            }
        }

        return results;
    }

    /**
     * Execute conditional workflow
     */
    async executeConditional(execution) {
        const results = {};
        
        for (const step of execution.workflow.steps) {
            // Check dependencies first
            if (!this.areDependenciesSatisfied(step, results)) {
                continue;
            }

            // Check condition
            if (step.condition && !step.condition(execution.context, results)) {
                execution.steps.get(step.id).state = AgentStates.SKIPPED;
                execution.metrics.skippedSteps++;
                continue;
            }

            const stepResult = await this.executeStepWithMetrics(step, execution, results);
            if (stepResult !== null) {
                results[step.id] = stepResult;
            }
        }

        return results;
    }

    /**
     * Execute pipeline workflow
     */
    async executePipeline(execution) {
        let pipelineData = execution.context.input || {};
        const results = {};

        for (const step of execution.workflow.steps) {
            if (this.shouldSkipStep(step, execution.context, results)) {
                execution.steps.get(step.id).state = AgentStates.SKIPPED;
                execution.metrics.skippedSteps++;
                continue;
            }

            try {
                execution.steps.get(step.id).state = AgentStates.RUNNING;
                execution.steps.get(step.id).startTime = new Date();

                // Transform input data if specified
                let stepInput = pipelineData;
                if (step.input_transform) {
                    stepInput = this.transformInput(pipelineData, step.input_transform);
                }

                const stepResult = await this.executeStep(step, { ...execution.context, input: stepInput });
                
                // Transform output for next step
                if (step.output_transform) {
                    pipelineData = this.transformOutput(stepResult, step.output_transform);
                } else {
                    pipelineData = stepResult;
                }

                results[step.id] = stepResult;
                execution.results[step.id] = stepResult;
                execution.steps.get(step.id).result = stepResult;
                execution.steps.get(step.id).state = AgentStates.COMPLETED;
                execution.steps.get(step.id).endTime = new Date();
                execution.metrics.completedSteps++;

            } catch (error) {
                execution.steps.get(step.id).state = AgentStates.FAILED;
                execution.steps.get(step.id).error = error;
                execution.steps.get(step.id).endTime = new Date();
                execution.metrics.failedSteps++;

                if (step.required !== false) {
                    throw error;
                }
            }
        }

        return { results, finalOutput: pipelineData };
    }

    /**
     * Execute event-driven workflow
     */
    async executeEventDriven(execution) {
        const results = {};
        const pendingSteps = new Set(execution.workflow.steps.map(step => step.id));
        
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Event-driven workflow timeout'));
            }, execution.options.timeout);

            const eventHandler = async (event) => {
                const triggeredSteps = execution.workflow.steps.filter(step => 
                    step.trigger_events && step.trigger_events.includes(event.type)
                );

                for (const step of triggeredSteps) {
                    if (!pendingSteps.has(step.id)) continue;

                    try {
                        const stepResult = await this.executeStepWithMetrics(step, execution, results);
                        if (stepResult !== null) {
                            results[step.id] = stepResult;
                            pendingSteps.delete(step.id);
                        }

                        // Emit completion event
                        this.emitEvent({
                            type: 'step_completed',
                            stepId: step.id,
                            result: stepResult,
                            executionId: execution.id
                        });

                    } catch (error) {
                        execution.errors.push({
                            stepId: step.id,
                            error: error.message
                        });
                    }
                }

                // Check if workflow is complete
                if (pendingSteps.size === 0) {
                    clearTimeout(timeout);
                    resolve(results);
                }
            };

            // Register event handler
            this.onEvent('*', eventHandler);

            // Trigger initial events if specified
            if (execution.workflow.initial_events) {
                execution.workflow.initial_events.forEach(eventType => {
                    this.emitEvent({ type: eventType, executionId: execution.id });
                });
            }
        });
    }

    /**
     * Execute hybrid workflow (combination of patterns)
     */
    async executeHybrid(execution) {
        const phases = this.groupStepsByPhase(execution.workflow.steps);
        const results = {};

        for (const phase of phases) {
            switch (phase.pattern) {
                case ExecutionPatterns.SEQUENTIAL:
                    const seqResults = await this.executeSequentialPhase(phase.steps, execution, results);
                    Object.assign(results, seqResults);
                    break;
                case ExecutionPatterns.PARALLEL:
                    const parResults = await this.executeParallelPhase(phase.steps, execution, results);
                    Object.assign(results, parResults);
                    break;
                case ExecutionPatterns.CONDITIONAL:
                    const condResults = await this.executeConditionalPhase(phase.steps, execution, results);
                    Object.assign(results, condResults);
                    break;
            }
        }

        return results;
    }

    /**
     * Execute individual step
     */
    async executeStep(step, context, previousResults = {}) {
        const agent = agentRegistry[step.agent];
        if (!agent) {
            throw new Error(`Agent ${step.agent} not found`);
        }

        // Update agent activity
        updateAgentActivity(step.agent);

        // Simulate agent execution (replace with actual agent invocation)
        const stepContext = {
            ...context,
            step: step.id,
            action: step.action,
            previousResults,
            timestamp: new Date()
        };

        // Timeout handling
        const timeout = step.timeout || this.defaultTimeout;
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Step ${step.id} timeout`)), timeout);
        });

        const executionPromise = this.invokeAgent(agent, step.action, stepContext);

        return Promise.race([executionPromise, timeoutPromise]);
    }

    /**
     * Invoke agent with specific action
     */
    async invokeAgent(agent, action, context) {
        // This is a placeholder for actual agent invocation
        // In a real implementation, this would call the agent's specific methods
        
        return new Promise((resolve) => {
            setTimeout(() => {
                const result = {
                    agent: agent.name,
                    action,
                    timestamp: new Date(),
                    context,
                    status: 'completed',
                    data: `Result from ${agent.name} for action ${action}`
                };
                resolve(result);
            }, Math.random() * 1000 + 500); // Simulate processing time
        });
    }

    /**
     * Execute step with metrics tracking
     */
    async executeStepWithMetrics(step, execution, results) {
        try {
            execution.steps.get(step.id).state = AgentStates.RUNNING;
            execution.steps.get(step.id).startTime = new Date();

            const stepResult = await this.executeStep(step, execution.context, results);
            
            execution.results[step.id] = stepResult;
            execution.steps.get(step.id).result = stepResult;
            execution.steps.get(step.id).state = AgentStates.COMPLETED;
            execution.steps.get(step.id).endTime = new Date();
            execution.metrics.completedSteps++;

            return stepResult;

        } catch (error) {
            execution.steps.get(step.id).state = AgentStates.FAILED;
            execution.steps.get(step.id).error = error;
            execution.steps.get(step.id).endTime = new Date();
            execution.metrics.failedSteps++;

            if (step.required !== false) {
                throw error;
            }
            
            return null;
        }
    }

    /**
     * Check if step dependencies are satisfied
     */
    areDependenciesSatisfied(step, results) {
        if (!step.dependencies) return true;
        
        return step.dependencies.every(dep => results.hasOwnProperty(dep));
    }

    /**
     * Check if step should be skipped
     */
    shouldSkipStep(step, context, results) {
        if (step.condition && !step.condition(context, results)) {
            return true;
        }
        
        if (!this.areDependenciesSatisfied(step, results)) {
            return true;
        }
        
        return false;
    }

    /**
     * Initialize step tracking
     */
    initializeSteps(steps) {
        const stepMap = new Map();
        
        steps.forEach(step => {
            stepMap.set(step.id, {
                id: step.id,
                agent: step.agent,
                state: AgentStates.QUEUED,
                startTime: null,
                endTime: null,
                duration: null,
                result: null,
                error: null
            });
        });
        
        return stepMap;
    }

    /**
     * Group steps by parallel execution groups
     */
    groupStepsByParallelGroup(steps) {
        const groups = new Map();
        
        steps.forEach(step => {
            const group = step.parallel_group || 'sequential';
            if (!groups.has(group)) {
                groups.set(group, []);
            }
            groups.get(group).push(step);
        });
        
        return groups;
    }

    /**
     * Group steps by execution phase for hybrid workflows
     */
    groupStepsByPhase(steps) {
        const phases = [];
        let currentPhase = null;
        
        steps.forEach(step => {
            if (step.phase) {
                if (!currentPhase || currentPhase.name !== step.phase) {
                    currentPhase = {
                        name: step.phase,
                        pattern: step.phase_pattern || ExecutionPatterns.SEQUENTIAL,
                        steps: []
                    };
                    phases.push(currentPhase);
                }
                currentPhase.steps.push(step);
            } else {
                // Default phase
                if (!currentPhase || currentPhase.name !== 'default') {
                    currentPhase = {
                        name: 'default',
                        pattern: ExecutionPatterns.SEQUENTIAL,
                        steps: []
                    };
                    phases.push(currentPhase);
                }
                currentPhase.steps.push(step);
            }
        });
        
        return phases;
    }

    /**
     * Transform context data
     */
    transformContext(context, stepResult, transformType) {
        switch (transformType) {
            case 'priority_assessment':
                return {
                    ...context,
                    priority: stepResult.priority || 'medium',
                    alert_type: stepResult.type || 'general'
                };
            case 'alert_to_opportunity':
                return {
                    ...context,
                    opportunity_id: stepResult.opportunity_id,
                    relevance_score: stepResult.relevance || 0.5
                };
            default:
                return { ...context, lastResult: stepResult };
        }
    }

    /**
     * Transform input data for pipeline steps
     */
    transformInput(data, transformType) {
        // Implement specific input transformations
        return data;
    }

    /**
     * Transform output data for pipeline steps
     */
    transformOutput(data, transformType) {
        // Implement specific output transformations
        return data;
    }

    /**
     * Generate unique execution ID
     */
    generateExecutionId() {
        return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Record workflow execution for analytics
     */
    recordWorkflowExecution(execution) {
        const record = {
            id: execution.id,
            workflowId: execution.workflowId,
            state: execution.state,
            startTime: execution.startTime,
            endTime: execution.endTime,
            duration: execution.duration,
            metrics: execution.metrics,
            success: execution.state === WorkflowStates.COMPLETED
        };

        this.workflowHistory.unshift(record);
        
        // Keep only last 100 executions
        if (this.workflowHistory.length > 100) {
            this.workflowHistory.pop();
        }
    }

    /**
     * Simple event system
     */
    emitEvent(event) {
        const handlers = this.eventBus.get(event.type) || [];
        const wildcardHandlers = this.eventBus.get('*') || [];
        
        [...handlers, ...wildcardHandlers].forEach(handler => {
            try {
                handler(event);
            } catch (error) {
                console.error('Event handler error:', error);
            }
        });
    }

    onEvent(eventType, handler) {
        if (!this.eventBus.has(eventType)) {
            this.eventBus.set(eventType, []);
        }
        this.eventBus.get(eventType).push(handler);
    }

    /**
     * Cancel active workflow
     */
    cancelWorkflow(executionId) {
        const execution = this.activeWorkflows.get(executionId);
        if (execution) {
            execution.state = WorkflowStates.CANCELLED;
            execution.endTime = new Date();
            execution.duration = execution.endTime - execution.startTime;
            this.recordWorkflowExecution(execution);
            this.activeWorkflows.delete(executionId);
            return true;
        }
        return false;
    }

    /**
     * Get workflow status
     */
    getWorkflowStatus(executionId) {
        const execution = this.activeWorkflows.get(executionId);
        if (!execution) {
            // Check history
            const historical = this.workflowHistory.find(h => h.id === executionId);
            return historical || null;
        }

        return {
            id: execution.id,
            workflowId: execution.workflowId,
            state: execution.state,
            startTime: execution.startTime,
            currentStep: this.getCurrentStep(execution),
            progress: this.calculateProgress(execution),
            metrics: execution.metrics,
            errors: execution.errors
        };
    }

    /**
     * Get current executing step
     */
    getCurrentStep(execution) {
        for (const [stepId, step] of execution.steps) {
            if (step.state === AgentStates.RUNNING) {
                return stepId;
            }
        }
        return null;
    }

    /**
     * Calculate workflow progress
     */
    calculateProgress(execution) {
        const total = execution.metrics.totalSteps;
        const completed = execution.metrics.completedSteps + execution.metrics.skippedSteps;
        return total > 0 ? (completed / total) * 100 : 0;
    }

    /**
     * Get orchestrator statistics
     */
    getStats() {
        return {
            activeWorkflows: this.activeWorkflows.size,
            registeredWorkflows: this.workflows.size,
            totalExecutions: this.workflowHistory.length,
            successRate: this.calculateSuccessRate(),
            averageDuration: this.calculateAverageDuration(),
            topWorkflows: this.getTopWorkflows()
        };
    }

    calculateSuccessRate() {
        const total = this.workflowHistory.length;
        if (total === 0) return 0;
        
        const successful = this.workflowHistory.filter(h => h.success).length;
        return (successful / total) * 100;
    }

    calculateAverageDuration() {
        const durations = this.workflowHistory
            .filter(h => h.duration)
            .map(h => h.duration);
        
        if (durations.length === 0) return 0;
        
        const sum = durations.reduce((acc, duration) => acc + duration, 0);
        return sum / durations.length;
    }

    getTopWorkflows() {
        const workflowCounts = {};
        
        this.workflowHistory.forEach(h => {
            workflowCounts[h.workflowId] = (workflowCounts[h.workflowId] || 0) + 1;
        });
        
        return Object.entries(workflowCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([workflowId, count]) => ({ workflowId, count }));
    }

    /**
     * List all workflows
     */
    listWorkflows() {
        return Array.from(this.workflows.values()).map(workflow => ({
            id: workflow.id,
            name: workflow.name,
            description: workflow.description,
            pattern: workflow.pattern,
            stepCount: workflow.steps.length,
            enabled: workflow.enabled,
            version: workflow.version
        }));
    }

    /**
     * Get workflow definition
     */
    getWorkflow(workflowId) {
        return this.workflows.get(workflowId);
    }

    /**
     * Enable/disable workflow
     */
    setWorkflowEnabled(workflowId, enabled) {
        const workflow = this.workflows.get(workflowId);
        if (workflow) {
            workflow.enabled = enabled;
            return true;
        }
        return false;
    }
}

// Export singleton instance
const agentOrchestrator = new AgentOrchestrator();

module.exports = {
    AgentOrchestrator,
    agentOrchestrator,
    ExecutionPatterns,
    WorkflowStates,
    AgentStates
};