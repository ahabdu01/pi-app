import { Request, Response } from 'express';
import { UserService } from '../service/UserService';
import logger from '../utils/logger';

export class UserController {
  constructor(private userService: UserService) {}

  async addUser(req: Request, res: Response): Promise<void> {
    const { username } = req.body || {};

    logger.info(`Received request to add user: username=${username}`);

    if (!username) {
      logger.error('Username is required');
      res.status(400).send('Username is required');
      return;
    }

    try {
      await this.userService.addUser(username);
      res.status(201).send(`User ${username} added successfully`);
    } catch (error) {
      logger.error(`Failed to add user: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).send(`Failed to add user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getScannedUsers(req: Request, res: Response): Promise<void> {
    logger.info('Received request for scanned users');
    try {
      const users = await this.userService.loadScannedUsers();
      res.json(users);
    } catch (error) {
      logger.error('Failed to load scanned users', error);
      res.status(500).send('Failed to load scanned users');
    }
  }
}
