import { Pool } from 'pg';
import logger from '../utils/logger';

export class UserRepository {
  constructor(private pool: Pool) {}

  async saveUser(username: string, userId: number): Promise<number> {
    try {
      const result = await this.pool.query(
        'INSERT INTO users (username, id, is_scanned) VALUES ($1, $2, FALSE) ON CONFLICT (id) DO NOTHING RETURNING id',
        [username, userId]
      );
      if (result.rows.length > 0) {
        logger.info(`Saved user ${username} to the database`);
        return result.rows[0].id;
      } else {
        const existingUserResult = await this.pool.query('SELECT id FROM users WHERE username = $1', [username]);
        return existingUserResult.rows[0].id;
      }
    } catch (error) {
      logger.error(`Failed to save user ${username} to the database`, error);
      throw error;
    }
  }

  async findUserByUsername(username: string): Promise<boolean> {
    try {
      const result = await this.pool.query('SELECT 1 FROM users WHERE username = $1', [username]);
      return result.rows.length > 0;
    } catch (error) {
      logger.error(`Failed to find user ${username} in the database`, error);
      throw error;
    }
  }

  async getUserIdsByUsernames(usernames: string[]): Promise<number[]> {
    if (usernames.length === 0) {
      logger.warn('No usernames provided to fetch user IDs');
      return [];
    }

    try {
      const query = `SELECT id FROM users WHERE username = ANY($1::text[])`;
      const result = await this.pool.query(query, [usernames]);
      return result.rows.map(row => row.id);
    } catch (error) {
      logger.error(`Failed to get user IDs for usernames ${usernames.join(', ')}`, error);
      return [];
    }
  }

  async updateUsersScannedStatus(userIds: number[]): Promise<void> {
    try {
      const query = `UPDATE users SET is_scanned = TRUE WHERE id = ANY($1::int[])`;
      await this.pool.query(query, [userIds]);
      logger.info(`Updated users ${userIds.join(', ')} scanned status to TRUE`);
    } catch (error) {
      logger.error(`Failed to update users ${userIds.join(', ')} scanned status`, error);
      throw error;
    }
  }

  async readScannedUsers(): Promise<string[]> {
    try {
      const result = await this.pool.query('SELECT username FROM users WHERE is_scanned = true');
      return result.rows.map(row => row.username);
    } catch (error) {
      logger.error('Failed to read scanned users from the database', error);
      return [];
    }
  }

  async readUsers(): Promise<string[]> {
    try {
      const result = await this.pool.query('SELECT username FROM users');
      return result.rows.map(row => row.username);
    } catch (error) {
      logger.error('Failed to read users from the database', error);
      return [];
    }
  }

  async createUser(username: string): Promise<void> {
    try {
      const result = await this.pool.query(
        'INSERT INTO users (username) VALUES ($1) ON CONFLICT (username) DO NOTHING RETURNING id',
        [username]
      );
      if (result.rows.length > 0) {
        logger.info(`Adding new user ${username} to the database`);
      }
    } catch (error) {
      logger.error(`Failed to create new user ${username} in the database`, error);
      throw error;
    }
  }
  
  async getUserIds(usernames: string[]): Promise<number[]> {
    if (usernames.length === 0) {
        logger.warn('No usernames provided to fetch user IDs');
        return [];
    }

    try {
        const query = `SELECT id FROM users WHERE username = ANY($1::text[])`;
        const result = await this.pool.query(query, [usernames]);
        return result.rows.map(row => row.id);
    } catch (error) {
        logger.error(`Failed to get user IDs for usernames ${usernames.join(', ')}`, error);
        return [];
    }
  }
}
