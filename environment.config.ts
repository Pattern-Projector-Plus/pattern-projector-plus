// environment.config.ts
import * as dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

interface Config {
  apiBaseUrl: string;
}

const config: Config = {
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5000', // Default URL
};

export default config;
