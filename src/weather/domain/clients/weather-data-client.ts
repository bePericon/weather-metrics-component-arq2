import { Temperature } from '../entities/temperature';

export interface WeatherDataClient {
    getLastDayTemperature(city: string): Promise<any[]>;
    getLastWeekTemperature(city: string): Promise<any[]>;
    getCurrentTemperature(city: string): Promise<Temperature | null>;
}
