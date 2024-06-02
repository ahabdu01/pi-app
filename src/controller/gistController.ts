import { Request, Response } from 'express';
import { GistService } from '../service/GistService';
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
}
