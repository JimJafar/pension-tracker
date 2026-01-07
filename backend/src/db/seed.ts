import { config, validateEnv } from '../config/env';
import { initializeDatabase } from '../config/database';
import { authService } from '../services/authService';
import { UserModel } from '../models/User';

const seed = async () => {
  try {
    console.log('Starting database seed...');

    // Validate environment
    validateEnv();

    // Initialize database
    await initializeDatabase();

    // Check if user already exists
    const existingUser = await UserModel.findByUsername(config.initialUsername);

    if (existingUser) {
      console.log(`User '${config.initialUsername}' already exists. Skipping seed.`);
      process.exit(0);
    }

    // Create initial user
    const userId = await authService.createUser(
      config.initialUsername,
      config.initialPassword
    );

    console.log(`Initial user created successfully!`);
    console.log(`Username: ${config.initialUsername}`);
    console.log(`Password: ${config.initialPassword}`);
    console.log(`\nIMPORTANT: Please change the password after first login!`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seed();
