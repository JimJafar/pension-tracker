import { getOne, getAll, insert } from '../config/database';

export interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

export const UserModel = {
  findById: async (id: number): Promise<User | undefined> => {
    return getOne<User>('SELECT * FROM users WHERE id = ?', [id]);
  },

  findByUsername: async (username: string): Promise<User | undefined> => {
    return getOne<User>('SELECT * FROM users WHERE username = ?', [username]);
  },

  create: async (username: string, passwordHash: string): Promise<number> => {
    return insert(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, passwordHash]
    );
  },

  getAll: async (): Promise<User[]> => {
    return getAll<User>('SELECT * FROM users');
  },
};
