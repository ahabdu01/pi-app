import 'reflect-metadata';
import express from 'express';
import { initializeDatabase, pool } from './database';
import logger from './utils/logger';
import { GistRepository } from './repository/GistRepository';
import { GistService } from './services/GistService';
import { GistController } from './controllers/gistController';
import { APP_PORT } from './config';

const app = express();
app.use(express.json());

initializeDatabase()
  .then(() => {
    // Initialize Repositories
    const gistRepository = new GistRepository(pool);
    
    // Initialize Services
    const gistService = new GistService(gistRepository);
    
    // Initialize Controllers
    const gistController = new GistController(gistService);

    // Routes setup
    app.get('/fetch-gists', (req, res) => gistController.fetchGists(req, res));
    app.get('/new-gists', (req, res) => gistController.getNewGists(req, res));
    app.get('/scanned-users', (req, res) => gistController.getScannedUsers(req, res));
    app.post('/add-user', (req, res) => gistController.addUser(req, res));

    app.listen(APP_PORT, () => {
      logger.info(`Server is running on port ${APP_PORT}`);
    });
  })
  .catch(err => {
    logger.error('Failed to initialize the database', err);
  });

export default app;
