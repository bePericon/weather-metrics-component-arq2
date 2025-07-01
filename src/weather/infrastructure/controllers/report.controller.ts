import { Request, Response } from 'express';
import { Controller, Get } from '@overnightjs/core';
import { StatusCodes } from 'http-status-codes';
import ApiResponse from '../../../shared/domain/value-objects/api-response';
import { Logger } from 'pino';
import { WeatherLoaderComponentClient } from '../clients/weather-loader-component.client';
import { ReportService } from '../../application/services/temperature-service';

@Controller('api/report')
export class ReportController {
    private readonly reportService: ReportService;

    constructor(private readonly logger: Logger) {
        const weatherLoaderComponentClient = new WeatherLoaderComponentClient(logger);
        this.reportService = new ReportService(weatherLoaderComponentClient, logger);
    }

    @Get('last-day')
    async GetLastDayTemperature(req: Request, res: Response): Promise<Response> {
        const start = Date.now();
        try {
            req.metrics.requestCounter.inc({
                method: req.method,
                status_code: res.statusCode,
            });
            this.logger.info(`BEGIN: [ReportController.GetLastDayTemperature]`);

            const lastDayTemperature = await this.reportService.getLastDayTemperature(
                req?.query?.city as string
            );

            return res
                .status(StatusCodes.OK)
                .json(
                    new ApiResponse(
                        `Temperaturas del ultimo dia encontradas`,
                        StatusCodes.OK,
                        lastDayTemperature
                    )
                );
        } finally {
            const responseTimeInMs = Date.now() - start;
            req.metrics.httpRequestTimer
                .labels(req.method, req.route.path, res.statusCode.toString())
                .observe(responseTimeInMs);
            this.logger.info(`END: [ReportController.GetLastDayTemperature]`);
        }
    }

    @Get('last-week')
    async GetLastWeekTemperature(req: Request, res: Response): Promise<Response> {
        const start = Date.now();
        try {
            req.metrics.requestCounter.inc({
                method: req.method,
                status_code: res.statusCode,
            });
            this.logger.info(`BEGIN: [ReportController.GetLastWeekTemperature]`);

            const lastWeekTemperature = await this.reportService.getLastWeekTemperature(
                req?.query?.city as string
            );

            return res
                .status(StatusCodes.OK)
                .json(
                    new ApiResponse(
                        `Temperaturas de la ultima semana encontradas`,
                        StatusCodes.OK,
                        lastWeekTemperature
                    )
                );
        } finally {
            const responseTimeInMs = Date.now() - start;
            req.metrics.httpRequestTimer
                .labels(req.method, req.route.path, res.statusCode.toString())
                .observe(responseTimeInMs);
            this.logger.info(`END: [ReportController.GetLastWeekTemperature]`);
        }
    }

    @Get('current-temperature')
    async GetCurrentTemperature(req: Request, res: Response): Promise<Response> {
        const start = Date.now();
        try {
            req.metrics.requestCounter.inc({
                method: req.method,
                status_code: res.statusCode,
            });
            this.logger.info(`BEGIN: [ReportController.GetCurrentTemperature]`);

            const currentTemp = await this.reportService.getCurrentTemperature(
                req?.query?.city as string
            );

            let response = null;
            response = currentTemp;

            return res
                .status(StatusCodes.OK)
                .json(
                    new ApiResponse(`Temperatura encontrada`, StatusCodes.OK, response)
                );
        } finally {
            const responseTimeInMs = Date.now() - start;
            req.metrics.httpRequestTimer
                .labels(req.method, req.route.path, res.statusCode.toString())
                .observe(responseTimeInMs);
            this.logger.info(`END: [ReportController.GetCurrentTemperature]`);
        }
    }
}
