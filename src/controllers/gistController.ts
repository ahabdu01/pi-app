import { Request, Response } from 'express';
import { GistService } from '../services/GistService';
import logger from '../utils/logger';

export class GistController {
  constructor(private gistService: GistService) {}

  async fetchGists(req: Request, res: Response): Promise<void> {
    logger.info('Received request to fetch gists');
    try {
      await this.gistService.checkForNewGists();
      const newGists = await this.gistService.loadNewGists();
      res.json(newGists);
    } catch (error) {
      logger.error('Failed to fetch and check for new gists');
      res.status(500).send('Failed to fetch and check for new gists');
    }
  }

  async getNewGists(req: Request, res: Response): Promise<void> {
    logger.info('Received request for new gists');
    const newGists = await this.gistService.loadNewGists();
    const gistIds = newGists.map(gist => gist.id);  // Ensure IDs are integers
    await this.gistService.markGistsAsViewed(gistIds);
    res.json(newGists);
  }

  async getScannedUsers(req: Request, res: Response): Promise<void> {
    logger.info('Received request for scanned users');
    const users = await this.gistService.loadUsers(true);
    res.json(users);
  }

  async addUser(req: Request, res: Response): Promise<void> {
    const { username } = req.body || {};
    logger.info(`Received request to add user: username=${username}`);

    if (!username) {
      logger.error('Username is required');
      res.status(400).send('Username is required');
      return;
    }

    try {
      await this.gistService.addUser(username);
      logger.info(`User ${username} added successfully`);
      res.status(201).send(`User ${username} added successfully`);
    } catch (error) {
      logger.error(`Failed to add user: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).send(`Failed to add user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
