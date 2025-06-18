import { WeatherDataClient } from '../clients/weather-data-client';
import { Temperature } from '../entities/temperature';

export class GetCurrentTemperature {
    constructor(private readonly weatherDataClient: WeatherDataClient) {}

    async execute(city: string): Promise<Temperature | null> {
        if (!city || city.trim() === '') {
            return null;
        }
        return this.weatherDataClient.getCurrentTemperature(city);
    }
}
