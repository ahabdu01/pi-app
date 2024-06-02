import axios from 'axios';
import { Gist } from '../model/Gist';
import logger from '../utils/logger';
import { createPipedriveDeal } from './PipedriveService';
import {GITHUB_TOKEN } from '../config';
import { GistRepository } from '../repository/GistRepository';
import { UserService } from './UserService';

const headers = GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {};

export class GistService {
  constructor(
    private gistRepository: GistRepository,
    private userService: UserService
  ) {}

  async fetchGists(): Promise<Gist[]> {
    logger.info('Fetching gists from GitHub');
    const users: string[] = await this.userService.loadUsers(null);

    // Map over the array of users and create a promise for each API call
    const gistPromises = users.map(async (username: string) => {
        const url = `https://api.github.com/users/${username}/gists`;
        try {
            const response = await axios.get<Gist[]>(url, { headers });
            logger.info(`Successfully sent request for fetch gists for user ${username}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.status === 403) {
                    logger.error('GitHub API rate limit exceeded. Consider using a personal access token.');
                }
                logger.error(`Failed to fetch gists for user ${username}: ${error.message}`);
            } else {
                logger.error(`Failed to fetch gists for user ${username}: ${String(error)}`);
            }
            throw error;
        }
    });

    try {
        // Wait for all promises to resolve and flatten the resulting arrays
        const allGists = await Promise.all(gistPromises);
        return allGists.flat();
    } catch (error) {
        logger.error(`Failed to fetch gists: ${String(error)}`);
        throw error;
    }
  }


  async checkForNewGists(): Promise<void> {
    logger.info('Checking for new gists');
    try {
      const gists = await this.fetchGists();
      const savedGistIds = await this.gistRepository.getSavedGistIds();

      const newGists = [];
      for (const gist of gists) {
        if (!savedGistIds.includes(gist.id.toString())) {
          let users = await this.userService.getUserIDs([gist.owner.login]);
          let userID = users[0]
          if (!users[0]) {
            userID = await this.userService.saveUser(gist.owner.login, gist.owner.id);
          }

          newGists.push({ ...gist, user_id: userID });
        }
      }

      let usernames = [];
      if (newGists.length > 0) {
        logger.info(`Found ${newGists.length} new gists`);
        await this.gistRepository.saveGists(newGists);

        for (const gist of newGists) {
          await createPipedriveDeal(gist);
          usernames.push(gist.owner.login)
        }

        await this.userService.addUsersToScannedList(usernames);
      } else {
        logger.info('No new gists found');
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error checking for new gists: ${error.message}`);
      } else {
        logger.error(`Error checking for new gists: ${String(error)}`);
      }
    }
  }

  async loadNewGists(): Promise<Gist[]> {
    return await this.gistRepository.readNewGists();
  }

  async markGistsAsViewed(gistIds: number[]): Promise<void> {
    await this.gistRepository.markGistsAsViewed(gistIds);
  }
}
