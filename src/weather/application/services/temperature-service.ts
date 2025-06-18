import { Logger } from 'pino';
import { Temperature } from '../../domain/entities/temperature';
import { GetCurrentTemperature } from '../../domain/uses-cases/get-current-temperature';
import { WeatherDataClient } from '../../domain/clients/weather-data-client';
import { ReportUseCase } from '../interfaces/report-use-case.interface';
import { TemperatureDto } from '../dtos/temperature-dto';

export class ReportService implements ReportUseCase {
    private readonly getCurrentTemperatureUseCase: GetCurrentTemperature;

    constructor(readonly weatherDataClient: WeatherDataClient, readonly logger: Logger) {
        this.getCurrentTemperatureUseCase = new GetCurrentTemperature(weatherDataClient);
    }
    async getCurrentTemperature(city: string): Promise<TemperatureDto | null> {
        const temperature = await this.getCurrentTemperatureUseCase.execute(city);
        return temperature ? this.mapToTemperatureDto(temperature) : null;
    }

    private mapToTemperatureDto(temperature: Temperature): TemperatureDto {
        return temperature;
    }
}
