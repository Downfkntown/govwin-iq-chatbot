class Logger {
    constructor(level = 'info') {
        this.level = level;
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };
    }

    log(level, message, meta = {}) {
        if (this.levels[level] <= this.levels[this.level]) {
            const timestamp = new Date().toISOString();
            const logEntry = {
                timestamp,
                level: level.toUpperCase(),
                message,
                ...meta
            };
            
            console.log(JSON.stringify(logEntry));
        }
    }

    error(message, meta = {}) {
        this.log('error', message, meta);
    }

    warn(message, meta = {}) {
        this.log('warn', message, meta);
    }

    info(message, meta = {}) {
        this.log('info', message, meta);
    }

    debug(message, meta = {}) {
        this.log('debug', message, meta);
    }
}

module.exports = Logger;
