import redis from '../../../shared/infrastructure/redis/redis-client'; // adaptá la ruta si cambia
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
    this.getLastDayTemperatureUseCase = new GetLastDayTemperatureUseCase(weatherDataClient);
    this.getLastWeekTemperatureUseCase = new GetLastWeekTemperatureUseCase(weatherDataClient);
  }

  async getCurrentTemperature(city: string): Promise<TemperatureDto | null> {
    const cacheKey = `current-temp:${city.toLowerCase()}`;
    try {
      const temperature = await this.getCurrentTemperatureUseCase.execute(city);
      if (temperature) {
        await redis.set(cacheKey, JSON.stringify(temperature), 'EX', 300); // TTL 5 min
        return this.mapToTemperatureDto(temperature);
      }
    } catch (err) {
      this.logger.warn(`[ReportService] Loader fallo para current-temperature, buscando en Redis`);
    }

    const cached = await redis.get(cacheKey);
    if (cached) {
      this.logger.info(`[ReportService] Valor actual obtenido desde Redis`);
      return JSON.parse(cached);
    }

    this.logger.warn(`[ReportService] No se pudo obtener temperatura actual de ninguna fuente`);
    return null;
  }

  async getLastDayTemperature(city: string): Promise<number | null> {
    const cacheKey = `last-day-temp:${city.toLowerCase()}`;

    try {
      const records = await this.getLastDayTemperatureUseCase.execute(city);
      this.logger.info(`[ReportService] Registros obtenidos para ${city}: ${records.length}`);

      if (!records.length) return null;

      const avg = records.reduce((sum, item) => sum + item.temp, 0) / records.length;
      const result = parseFloat(avg.toFixed(2));

      this.logger.info(`[ReportService] Promedio ultimo dia (${city}): ${result}`);
      await redis.set(cacheKey, result.toString(), 'EX', 1800); // TTL 30 min

      return result;
    } catch (err) {
      this.logger.warn(`[ReportService] Loader fallo para last-day, buscando en Redis`);
    }

    const cached = await redis.get(cacheKey);
    if (cached) {
      this.logger.info(`[ReportService] Promedio dia obtenido desde Redis`);
      return parseFloat(cached);
    }

    this.logger.warn(`[ReportService] No se pudo obtener promedio del ultimo dia`);
    return null;
  }

  async getLastWeekTemperature(city: string): Promise<number | null> {
    const cacheKey = `last-week-temp:${city.toLowerCase()}`;

    try {
      const records = await this.getLastWeekTemperatureUseCase.execute(city);
      const temps = records.map(r => r.temp).filter(t => typeof t === 'number' && !isNaN(t));

      if (temps.length === 0) {
        this.logger.warn(`[ReportService] No se encontraron temperaturas validas para ${city}`);
        return null;
      }

      const avg = temps.reduce((sum, t) => sum + t, 0) / temps.length;
      const result = parseFloat(avg.toFixed(2));

      this.logger.info(`[ReportService] Promedio ultima semana (${city}): ${result}`);
      await redis.set(cacheKey, result.toString(), 'EX', 3600); // TTL 1 hora

      return result;
    } catch (err) {
      this.logger.warn(`[ReportService] Loader fallo para last-week, buscando en Redis`);
    }

    const cached = await redis.get(cacheKey);
    if (cached) {
      this.logger.info(`[ReportService] Promedio semana obtenido desde Redis`);
      return parseFloat(cached);
    }

    this.logger.warn(`[ReportService] No se pudo obtener promedio de la ultima semana`);
    return null;
  }

  private mapToTemperatureDto(temperature: Temperature): TemperatureDto {
    return temperature;
  }
}
