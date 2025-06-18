import express, { Application } from 'express';
import { Server } from '@overnightjs/core';
import morgan, { TokenIndexer } from 'morgan';
import cors from 'cors';
import { IncomingMessage, ServerResponse } from 'http';
import { corsOptions } from './config/cors';
import customServer from 'express-promise-router';
// import mongoose from 'mongoose';
// import config from './config/config';
import cookieParser from 'cookie-parser';
import errorMiddleware from './shared/infrastructure/error.middleware';
import logger from './config/logger';
import { ReportController } from './weather/infrastructure/controllers/report.controller';

export class ServerApp extends Server {
    constructor() {
        super(true);
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(morgan(this.morganJsonFormat));
        this.app.use(cookieParser());
        this.app.use(cors(corsOptions));
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Credentials', 'true');
            next();
        });

        this.setupControllers();

        this.app.use(errorMiddleware);

        // this.initConnectionDB();
    }

    private morganJsonFormat(
        tokens: TokenIndexer,
        req: IncomingMessage,
        res: ServerResponse
    ) {
        const status = tokens.status(req, res);
        const statusInfo = ['200', '201'];

        return JSON.stringify({
            date: tokens.date(req, res, 'iso'),
            method: tokens.method(req, res),
            url: tokens.url(req, res),
            status: status,
            response: `${tokens['response-time'](req, res)} ms`,
            level: statusInfo.includes(status as string) ? 'INFO' : 'WARN',
        });
    }

    private setupControllers(): void {
        const reportController = new ReportController(logger);
        this.addControllers([reportController], customServer);
    }

    // private async initConnectionDB(): Promise<void> {
    //     const CONN_STR = config.db_connection_string as string;
    //     const db = await mongoose.connect(CONN_STR);
    //     logger.info(`[Server] Data base is connect: ${db.connection.name}`);
    // }

    public getApp(): Application {
        return this.app;
    }

    public start(port: number) {
        this.app.listen(port, () => {
            logger.info('[Server] Running on port: ' + port);
        });
    }
}
