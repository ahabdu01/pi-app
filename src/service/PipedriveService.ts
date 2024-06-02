import axios from 'axios';
import { Gist } from '../model/Gist';
import { Deal } from '../model/Deal';
import logger from '../utils/logger';
import { PIPEDRIVE_API_TOKEN } from '../config';

const PIPEDRIVE_API_URL = `https://api.pipedrive.com/v1`;

export async function createPipedriveDeal(gist: Gist): Promise<void> {
  const dealData: Deal = {
    title: gist.description || 'No description',
    value: 0,
    currency: 'USD'
  };

  try {
    logger.info(`Creating Pipedrive deal for gist: ${gist.id}`);
    await axios.post(`${PIPEDRIVE_API_URL}/deals?api_token=${PIPEDRIVE_API_TOKEN}`, dealData);
    logger.info(`Successfully created Pipedrive deal for gist: ${gist.id} of user: ${gist.owner.login}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(`Failed to create Pipedrive deal for gist: ${gist.id} of user: ${gist.owner.login} - ${error.message}`);
    } else {
      logger.error(`Failed to create Pipedrive deal for gist: ${gist.id} of user: ${gist.owner.login} - ${String(error)}`);
    }
    throw error;
  }
}
