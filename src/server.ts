import express, { Application } from 'express';
import { Server } from '@overnightjs/core';
import morgan, { TokenIndexer } from 'morgan';
import cors from 'cors';
import { IncomingMessage, ServerResponse } from 'http';
import { corsOptions } from './config/cors';
import customServer from 'express-promise-router';
import cookieParser from 'cookie-parser';
import errorMiddleware from './shared/infrastructure/error.middleware';
import logger from './config/logger';
import { ReportController } from './weather/infrastructure/controllers/report.controller';
import promClient from 'prom-client';
import MetricsController from './weather/infrastructure/controllers/metrics.controller';

declare module 'express-serve-static-core' {
    interface Request {
        metrics?: any;
    }
}

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

        this.setupMetrics();

        this.setupControllers();

        this.app.use(errorMiddleware);
    }

    private morganJsonFormat(
        tokens: TokenIndexer,
        req: IncomingMessage,
        res: ServerResponse
    ) {
        const status = tokens.status(req, res);
        const statusInfo = ['200', '201'];

        const url = tokens.url(req, res);
        if (url !== '/metrics') {
            return JSON.stringify({
                date: tokens.date(req, res, 'iso'),
                method: tokens.method(req, res),
                url: tokens.url(req, res),
                status: status,
                response: `${tokens['response-time'](req, res)} ms`,
                level: statusInfo.includes(status as string) ? 'INFO' : 'WARN',
            });
        }
    }

    private setupMetrics(): void {
        // Create a Registry to register the metrics
        const register = new promClient.Registry();
        register.setDefaultLabels({
            app: 'wmc-app',
        });
        promClient.collectDefaultMetrics({ register });

        const httpRequestTimer = new promClient.Histogram({
            name: 'http_request_duration_ms',
            help: 'Duration of HTTP requests in ms',
            labelNames: ['method', 'route', 'code'],
            // buckets for response time from 0.1ms to 1s
            buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500, 1000],
        });
        const requestCounter = new promClient.Counter({
            name: 'http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'status_code'],
        });

        register.registerMetric(httpRequestTimer);
        register.registerMetric(requestCounter);

        this.app.use((req, res, next) => {
            req.metrics = { register, httpRequestTimer, requestCounter };
            next();
        });
    }

    private setupControllers(): void {
        const reportController = new ReportController(logger);
        const metricsController = new MetricsController(logger);
        this.addControllers([reportController, metricsController], customServer);
    }

    public getApp(): Application {
        return this.app;
    }

    public start(port: number) {
        this.app.listen(port, () => {
            logger.info('[Server] Running on port: ' + port);
        });
    }
}
