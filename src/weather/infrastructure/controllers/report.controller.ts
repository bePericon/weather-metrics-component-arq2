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
         const lastDayTemperature = await this.reportService.getLastDayTemperature(
            req?.query?.city as string
         );

        return res
             .status(StatusCodes.OK)
             .json(new ApiResponse(`Temperaturas del ultimo dia encontradas`, StatusCodes.OK, lastDayTemperature));
     }

    @Get('last-week')
    async GetLastWeekTemperature(req: Request, res: Response): Promise<Response> {
         const lastWeekTemperature = await this.reportService.getLastWeekTemperature(
             req?.query?.city as string
         );

         return res
            .status(StatusCodes.OK)
             .json(new ApiResponse(`Temperaturas de la ultima semana encontradas`, StatusCodes.OK, lastWeekTemperature));
     }

    @Get('current-temperature')
    async GetCurrentTemperature(req: Request, res: Response): Promise<Response> {
        const currentTemp = await this.reportService.getCurrentTemperature(
            req?.query?.city as string
        );

        let response = null;
        // if (!currentTemp) {
        //     const loaded = await this.reportService.loadWeatherDataForCity(
        //         req.query.city as string
        //     );

        //     // TODO: add redis
        //     if (loaded)
        //         response =
        //             this.temperatureService.mapToTemperatureDtoFromWeatherData(loaded);
        // } else 
        response = currentTemp;

        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(`Temperatura encontrada`, StatusCodes.OK, response));
    }
}
