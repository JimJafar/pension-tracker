import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
export const validateEnv = (): void => {
  const required = ['SESSION_SECRET', 'ALPHAVANTAGE_API_KEY'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing.join(', '));
    console.error('Please create a .env file with the required variables.');
    process.exit(1);
  }
};

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  sessionSecret: process.env.SESSION_SECRET!,
  alphaVantageApiKey: process.env.ALPHAVANTAGE_API_KEY!,
  databasePath: process.env.DATABASE_PATH || './pension_tracker.db',
  initialUsername: process.env.INITIAL_USERNAME || 'admin',
  initialPassword: process.env.INITIAL_PASSWORD || 'changeme',
};
