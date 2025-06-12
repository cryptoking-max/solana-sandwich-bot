const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'sandwich-bot' },
    transports: [
        // Write all logs with level 'error' and below to error.log
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Write all logs with level 'info' and below to combined.log
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Write all logs to console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// Create a stream object for Morgan
logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};

// Add custom logging methods
logger.logSandwich = (data) => {
    logger.info('Sandwich executed', {
        type: 'sandwich',
        ...data
    });
};

logger.logProfit = (data) => {
    logger.info('Profit calculated', {
        type: 'profit',
        ...data
    });
};

logger.logError = (error, context = {}) => {
    logger.error('Error occurred', {
        type: 'error',
        error: error.message,
        stack: error.stack,
        ...context
    });
};

logger.logMempool = (data) => {
    logger.debug('Mempool activity', {
        type: 'mempool',
        ...data
    });
};

module.exports = logger; 