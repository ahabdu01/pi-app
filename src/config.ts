import * as dotenv from 'dotenv';

dotenv.config();

export const GITHUB_USERNAME = process.env.GITHUB_USERNAME!;
export const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
export const PIPEDRIVE_API_TOKEN = process.env.PIPEDRIVE_API_TOKEN!;
export const APP_PORT = process.env.APP_PORT || 8080;
export const POSTGRES_USER = process.env.POSTGRES_USER;
export const DB_HOST = process.env.DB_HOST;
export const POSTGRES_DB = process.env.POSTGRES_DB;
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
export const DB_PORT = process.env.DB_PORT;