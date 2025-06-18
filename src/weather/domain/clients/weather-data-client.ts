import { Temperature } from '../entities/temperature';

export interface WeatherDataClient {
    getCurrentTemperature(city: string): Promise<Temperature | null>;
}
