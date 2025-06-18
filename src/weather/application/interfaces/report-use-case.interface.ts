import { TemperatureDto } from "../dtos/temperature-dto";

export interface ReportUseCase {
	getCurrentTemperature(city: string): Promise<TemperatureDto | null>;
}