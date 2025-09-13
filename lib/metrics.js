const promClient = require('prom-client');

// Create metrics
const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status']
});

const csmQueryTotal = new promClient.Counter({
    name: 'csm_queries_total',
    help: 'Total number of CSM queries processed',
    labelNames: ['agent', 'intent', 'success']
});

const activeConversations = new promClient.Gauge({
    name: 'csm_active_conversations',
    help: 'Number of active conversations'
});

module.exports = {
    httpRequestDuration,
    csmQueryTotal,
    activeConversations,
    register: promClient.register
};
