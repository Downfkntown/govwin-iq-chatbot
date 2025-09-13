const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
    const numCPUs = os.cpus().length;
    console.log(`Master ${process.pid} is running`);
    
    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        console.log('Starting a new worker');
        cluster.fork();
    });
} else {
    const IntegratedGovWinCSMServer = require('./server-integrated');
    const server = new IntegratedGovWinCSMServer();
    
    server.start().catch(error => {
        console.error('Failed to start worker:', error);
        process.exit(1);
    });
    
    console.log(`Worker ${process.pid} started`);
}
