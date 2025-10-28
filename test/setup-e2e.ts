import * as dotenv from 'dotenv';

// Ensure test env
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// Load .env.test if present
dotenv.config({ path: '.env.test' });
