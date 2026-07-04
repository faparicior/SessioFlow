import * as dotenv from 'dotenv';
import * as path from 'path';

export default function setup() {
  // Load environment variables from .env.local
  dotenv.config({path: path.resolve(process.cwd(), '.env.local')});
}