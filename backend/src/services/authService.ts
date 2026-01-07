import bcrypt from 'bcrypt';
import { UserModel } from '../models/User';

const SALT_ROUNDS = 10;

export const authService = {
  hashPassword: async (password: string): Promise<string> => {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  verifyPassword: async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
  },

  login: async (username: string, password: string): Promise<{ id: number; username: string } | null> => {
    const user = await UserModel.findByUsername(username);

    if (!user) {
      return null;
    }

    const isValid = await authService.verifyPassword(password, user.password_hash);

    if (!isValid) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
    };
  },

  createUser: async (username: string, password: string): Promise<number> => {
    const passwordHash = await authService.hashPassword(password);
    return UserModel.create(username, passwordHash);
  },
};
