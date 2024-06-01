import { Pool } from 'pg';
import logger from '../utils/logger';

export class GistRepository {
  constructor(private pool: Pool) {}

  async saveGists(gists: any[]): Promise<void> {
    try {
      const query = `INSERT INTO gists (gist_id, description, created_at, user_id, is_viewed) VALUES ($1, $2, $3, $4, FALSE)
                     ON CONFLICT (gist_id) DO NOTHING`;
      for (const gist of gists) {
        await this.pool.query(query, [gist.id, gist.description, new Date(gist.created_at), gist.user_id]);
      }
      logger.info(`Saved ${gists.length} new gists to the database`);
    } catch (error) {
      logger.error('Failed to save new gists to the database', error);
    }
  }

  async readGists(): Promise<any[]> {
    try {
      const result = await this.pool.query('SELECT * FROM gists');
      return result.rows;
    } catch (error) {
      logger.error('Failed to read gists from the database', error);
      return [];
    }
  }

  async readNewGists(): Promise<any[]> {
    try {
      const result = await this.pool.query('SELECT * FROM gists WHERE is_viewed = FALSE');
      return result.rows;
    } catch (error) {
      logger.error('Failed to read new gists from the database', error);
      return [];
    }
  }

  async getSavedGistIds(): Promise<string[]> {
    try {
      const result = await this.pool.query('SELECT gist_id FROM gists');
      return result.rows.map(row => row.gist_id);
    } catch (error) {
      logger.error('Failed to fetch saved gist IDs from the database', error);
      return [];
    }
  }

  async markGistsAsViewed(gistIds: number[]): Promise<void> {
    try {
      logger.info(`Attempting to mark gists as viewed: ${gistIds.join(', ')}`);
      const query = 'UPDATE gists SET is_viewed = TRUE WHERE id = ANY($1::int[])';
      const result = await this.pool.query(query, [gistIds]);
      if (result.rowCount === 0) {
        logger.warn(`No gists were marked as viewed for gist IDs: ${gistIds.join(', ')}`);
      } else {
        logger.info(`Successfully marked ${result.rowCount} gists as viewed`);
      }
    } catch (error) {
      logger.error('Failed to mark gists as viewed', error);
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
        // If the user already exists, fetch the existing user's ID
        const existingUserResult = await this.pool.query('SELECT id FROM users WHERE username = $1', [username]);
        return existingUserResult.rows[0].id;
      }
    } catch (error) {
      logger.error(`Failed to save user ${username} to the database`, error);
      throw error;
    }
  }

  async createUser(username: string) {
    try {
      const result = await this.pool.query(
        'INSERT INTO users (username) VALUES ($1) ON CONFLICT (id) DO NOTHING RETURNING id',
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
}
