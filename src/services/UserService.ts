import { UserRepository } from '../repository/UserRepository';
import logger from '../utils/logger';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async addUsersToScannedList(usernames: string[]): Promise<void> {
    const userIDs = await this.userRepository.getUserIds(usernames);
    if (userIDs.length > 0) {
      await this.userRepository.updateUsersScannedStatus(userIDs);
    } else {
      throw new Error(`Users not found`);
    }
  }

  async loadUsers(isScanned: boolean | null): Promise<string[]> {
    if (isScanned === true) {
      return await this.userRepository.readScannedUsers();
    }

    return await this.userRepository.readUsers();
  }


  async addUser(username: string): Promise<void> {
    try {
      const userExists = await this.userRepository.getUserIds([username]);
      if (userExists.length > 0) {
        logger.info(`User ${username} already exists`);
        throw new Error(`User ${username} already exists`);
      }

      await this.userRepository.createUser(username);
      logger.info(`Successfully added user ${username}`);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Failed to add user ${username}: ${error.message}`);
      } else {
        logger.error(`Failed to add user ${username}: ${String(error)}`);
      }
      throw error;
    }
  }

  async getUserIDs(usernames: string[]): Promise<number[]> {
    return this.userRepository.getUserIdsByUsernames(usernames);
  }

  async loadScannedUsers(): Promise<string[]> {
    return this.userRepository.readScannedUsers();
  }

  async saveUser(username: string, userId: number) {
    return this.userRepository.saveUser(username, userId)
  }
}
