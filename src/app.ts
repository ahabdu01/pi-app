import 'reflect-metadata';
import express from 'express';
import { initializeDatabase, pool } from './database';
import logger from './utils/logger';
import dotenv from 'dotenv';
import { GistRepository } from './repository/GistRepository';
import { GistService } from './services/GistService';
import { GistController } from './controllers/gistController';
import { UserRepository } from './repository/UserRepository';
import { UserService } from './services/UserService';
import { UserController } from './controllers/userController';

dotenv.config();

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

initializeDatabase()
  .then(() => {
    const gistRepository = new GistRepository(pool);
    const userRepository = new UserRepository(pool);
    const userService = new UserService(userRepository);
    const gistService = new GistService(gistRepository, userService);
    const gistController = new GistController(gistService);
    const userController = new UserController(userService);

    app.get('/fetch-gists', (req, res) => gistController.fetchGists(req, res));
    app.get('/new-gists', (req, res) => gistController.getNewGists(req, res));
    app.get('/scanned-users', (req, res) => userController.getScannedUsers(req, res));
    app.post('/add-user', (req, res) => userController.addUser(req, res));

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    logger.error('Failed to initialize the database', err);
  });

export default app;
