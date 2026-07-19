import { config } from 'dotenv';

config({ path: '.env' });

export const BACKEND_BASE_URL = process.env.NODE_ENV === 'test'
  ? process.env.TEST_API_URL || 'http://localhost:3001'
  : process.env.API_URL || 'http://localhost:3001';
