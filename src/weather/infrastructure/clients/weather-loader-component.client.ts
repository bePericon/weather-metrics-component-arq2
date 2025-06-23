import axios from 'axios';
import { WeatherDataClient } from '../../domain/clients/weather-data-client';
import config from '../../../config/config';
import CircuitBreaker from 'opossum';
import { Logger } from 'pino';
import { Temperature } from '../../domain/entities/temperature';

export class WeatherLoaderComponentClient implements WeatherDataClient {
  private logName: string = 'WeatherLoaderComponentClient';
  private circuitBreaker: CircuitBreaker;

  constructor(private readonly logger: Logger) {
    const options: CircuitBreaker.Options = {
      timeout: 3000,
      errorThresholdPercentage: 30,
      resetTimeout: 30000,
    };

    // Circuit breaker unificado que recibe objeto { city, endpoint }
    this.circuitBreaker = new CircuitBreaker(
      (params: { city: string; endpoint?: string }) =>
        this.makeApiCall(params.city, params.endpoint),
      options
    );

    this.circuitBreaker.fallback(() => {
      this.logger.error(
        `[${this.logName}] OpenWeatherMap API is currently unavailable (Circuit Breaker is OPEN)`
      );
      return null;
    });

    this.addEventListeners();
  }

  // Método reutilizable
  private async makeApiCall(
    city: string,
    endpoint: string = ''
  ): Promise<Temperature | null> {
    const suffix = endpoint ? `/${endpoint}` : '';
    const url = `${config.weatherLoaderComponentUrl}${suffix}?city=${city}`;
    this.logger.info(`[${this.logName}] Requesting from: ${url}`);

    const { data } = await axios.get(url, { timeout: 3000 });

    return data?.data ?? null;
  }

  // Métodos públicos
  async getCurrentTemperature(city: string): Promise<any> {
    return this.circuitBreaker.fire({ city });
  }

  async getLastDayTemperature(city: string): Promise<any> {
    return this.circuitBreaker.fire({ city, endpoint: 'last-day' });
  }

  async getLastWeekTemperature(city: string): Promise<any> {
    return this.circuitBreaker.fire({ city, endpoint: 'last-week' });
  }

  private addEventListeners(): void {
    const serviceName = 'WeatherLoaderComponent';

    this.circuitBreaker.on('open', () =>
      this.logger.warn(`[${this.logName}] Circuit Breaker for ${serviceName} has opened.`)
    );
    this.circuitBreaker.on('close', () =>
      this.logger.info(`[${this.logName}] Circuit Breaker for ${serviceName} has closed.`)
    );
    this.circuitBreaker.on('halfOpen', () =>
      this.logger.warn(`[${this.logName}] Circuit Breaker for ${serviceName} is half-open.`)
    );
    this.circuitBreaker.on('failure', (error) =>
      this.logger.error(
        { error: error },
        `[${this.logName}] Circuit Breaker recorded a failure for ${serviceName}: ${error}`
      )
    );
    this.circuitBreaker.on('success', () =>
      this.logger.info(`[${this.logName}] Circuit Breaker recorded a success for ${serviceName}.`)
    );
    this.circuitBreaker.on('fallback', () =>
      this.logger.warn(`[${this.logName}] Circuit Breaker fallback executed for ${serviceName}.`)
    );
  }
}
