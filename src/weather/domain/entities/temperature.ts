export interface TemperatureProps {
    weatherDataId: string;
    name: string;
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    timestamp: string
}

export class Temperature {
    public readonly weatherDataId: string;
    public readonly name: string;
    public readonly temp: number;
    public readonly feels_like: number;
    public readonly temp_min: number;
    public readonly temp_max: number;
    public readonly timestamp: string

    constructor(props: TemperatureProps) {
        this.weatherDataId = props.weatherDataId;
        this.name = props.name;
        this.temp = props.temp;
        this.feels_like = props.feels_like;
        this.temp_min = props.temp_min;
        this.temp_max = props.temp_max;
        this.timestamp = props.timestamp;
    }
}
