import pino, { Logger } from 'pino';

const pinoOptions: pino.LoggerOptions = {
    level: process.env.LOG_LEVEL || 'info',
};

if (process.env.NODE_ENV === 'development') {
    pinoOptions.transport = {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
            ignore: 'pid,hostname',
        },
    };
}

const logger: Logger = pino(pinoOptions);

export default logger;
