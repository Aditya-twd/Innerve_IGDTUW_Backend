const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from root .env file
dotenv.config({
  path: path.resolve(__dirname, '..', '..', '.env'),
});

const config = {
  port: process.env.PORT || 4000,
  databaseUrl: process.env.DATABASE_URL,
};

module.exports = config;

