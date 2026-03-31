import { User } from '@/interfaces/userEntity';
import { BaseService } from './baseService';

export class UserService extends BaseService<User> {
  constructor() {
    super('users');
  }
}

export const userService = new UserService();