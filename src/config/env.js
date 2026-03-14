const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from root .env file
dotenv.config({
  path: path.resolve(__dirname, '..', '..', '.env'),
});

function normalizeOrigin(origin) {
  return String(origin || '').trim().replace(/\/$/, '');
}

const requiredCorsOrigins = [
  'https://campusmind-insights.vercel.app',
  'https://campusmind-connect.vercel.app',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:8082',
];

const envCorsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean);

const corsOrigins = Array.from(
  new Set([...envCorsOrigins, ...requiredCorsOrigins.map(normalizeOrigin)])
);

const config = {
  port: process.env.PORT || 4000,
  databaseUrl: process.env.DATABASE_URL,
  corsOrigins,
};

module.exports = config;

