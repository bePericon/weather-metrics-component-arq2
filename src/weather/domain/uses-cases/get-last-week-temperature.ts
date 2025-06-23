import { WeatherDataClient } from '../clients/weather-data-client';
import { Temperature } from '../entities/temperature';

export class GetLastWeekTemperatureUseCase {
    constructor(private readonly weatherDataClient: WeatherDataClient) {}

    async execute(city: string): Promise<any[]> {
        if (!city || city.trim() === '') {
            return [];
        }
        return this.weatherDataClient.getLastWeekTemperature(city);
    }
}
