import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async getUserById(userId: string): Promise<User> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async updateUser(userId: string, data: any) {}
}
