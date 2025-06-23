import { Logger } from 'pino';
import { Temperature } from '../../domain/entities/temperature';
import { GetCurrentTemperature } from '../../domain/uses-cases/get-current-temperature';
import { WeatherDataClient } from '../../domain/clients/weather-data-client';
import { ReportUseCase } from '../interfaces/report-use-case.interface';
import { TemperatureDto } from '../dtos/temperature-dto';
import { GetLastDayTemperatureUseCase } from '../../domain/uses-cases/get-last-day-temperature';
import { GetLastWeekTemperatureUseCase } from '../../domain/uses-cases/get-last-week-temperature';

export class ReportService implements ReportUseCase {

    
    private readonly getCurrentTemperatureUseCase: GetCurrentTemperature;
    private readonly getLastDayTemperatureUseCase: GetLastDayTemperatureUseCase;
    private readonly getLastWeekTemperatureUseCase: GetLastWeekTemperatureUseCase;

    constructor(readonly weatherDataClient: WeatherDataClient, readonly logger: Logger) {
        this.getCurrentTemperatureUseCase = new GetCurrentTemperature(weatherDataClient);
        this.getLastDayTemperatureUseCase = new GetLastDayTemperatureUseCase(weatherDataClient)
        this.getLastWeekTemperatureUseCase = new GetLastWeekTemperatureUseCase(weatherDataClient) 
    }
    async getCurrentTemperature(city: string): Promise<TemperatureDto | null> {
        const temperature = await this.getCurrentTemperatureUseCase.execute(city);
        return temperature ? this.mapToTemperatureDto(temperature) : null;
    }

    async getLastDayTemperature(city: string): Promise<number | null> {
    
        const records = await this.getLastDayTemperatureUseCase.execute(city);
        
        if (!records.length) return null;

        const avg =
        records.reduce((sum, item) => sum + item.temp, 0) / records.length;
        console.log(avg)
        return parseFloat(avg.toFixed(2));
    }

    async getLastWeekTemperature(city: string): Promise<number | null> {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

            // Obtener registros usando un caso de uso
            const records = await this.getLastWeekTemperatureUseCase.execute(city);

            // Extraer solo temperaturas válidas (campo temp)
            const temps = records
                .map(r => r.temp)
                .filter(t => typeof t === 'number' && !isNaN(t));

            if (temps.length === 0) {
                this.logger.warn(`[TemperatureService] No se encontraron temperaturas válidas para ${city}`);
                return null;
            }

            const avg = temps.reduce((sum, t) => sum + t, 0) / temps.length;
            this.logger.info(`[TemperatureService] Promedio ultima semana (${city}): ${avg}`);

            return parseFloat(avg.toFixed(2));
    }

    private mapToTemperatureDto(temperature: Temperature): TemperatureDto {
        return temperature;
    }
}
