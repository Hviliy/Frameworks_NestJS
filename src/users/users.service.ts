import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(data: Pick<User, 'username' | 'email' | 'passwordHash'>) {
    try {
      return await this.usersRepository.save(this.usersRepository.create(data));
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new ConflictException(
          'Пользователь с таким именем или электронной почтой уже существует',
        );
      }
      throw error;
    }
  }

  findById(id: number) {
    return this.usersRepository.findOneBy({ id });
  }

  findByUsernameWithPassword(username: string) {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.username = :username', { username })
      .getOne();
  }
}
