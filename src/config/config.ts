import dotenv from 'dotenv';

dotenv.config();

const config = {
    port: process.env.PORT,
    base_path: process.env.BASE_PATH,
    weatherLoaderComponentUrl: process.env.WEATHER_LOADER_COMPONENT_URL,
    ttl_redis_current_temp: Number(process.env.TTL_REDIS_CURRENT_TEMPERATURE),
    ttl_redis_last_day_temp: Number(process.env.TTL_REDIS_LAST_DAY_TEMPERATURE),
    ttl_redis_last_week_temp: Number(process.env.TTL_REDIS_LAST_WEEK_TEMPERATURE),
};

export default config;
