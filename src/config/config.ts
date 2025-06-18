import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: process.env.PORT,
  base_path: process.env.BASE_PATH,
  weatherLoaderComponentUrl: process.env.WEATHER_LOADER_COMPONENT_URL,
};

export default config;
