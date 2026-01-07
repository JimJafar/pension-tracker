import app from './app';
import { config, validateEnv } from './config/env';
import { initializeDatabase } from './config/database';

const startServer = async () => {
  try {
    // Validate environment variables
    validateEnv();

    // Initialize database
    await initializeDatabase();

    // Start server
    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
