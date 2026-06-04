import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcrypt';

import { UserRole } from '../users/user-role.enum';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const usersService = {
    create: jest.fn(),
    findByUsernameWithPassword: jest.fn(),
  };
  const jwtService = {
    signAsync: jest.fn(),
  };
  const service = new AuthService(
    usersService as unknown as UsersService,
    jwtService as unknown as JwtService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('регистрирует обычного пользователя без возврата хеша пароля', async () => {
    usersService.create.mockResolvedValue(createUser());

    const result = await service.register({
      username: 'user',
      email: 'user@example.com',
      password: 'WorkshopUser_2026!Secure',
    });

    expect(result).toEqual({
      id: 1,
      username: 'user',
      email: 'user@example.com',
      role: UserRole.USER,
    });
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('возвращает JWT для корректных учётных данных', async () => {
    const user = createUser();
    user.passwordHash = await hash('WorkshopUser_2026!Secure', 4);
    usersService.findByUsernameWithPassword.mockResolvedValue(user);
    jwtService.signAsync.mockResolvedValue('token');

    const result = await service.login({
      username: 'user',
      password: 'WorkshopUser_2026!Secure',
    });

    expect(result.access_token).toBe('token');
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('отклоняет некорректные учётные данные', async () => {
    usersService.findByUsernameWithPassword.mockResolvedValue(null);

    await expect(
      service.login({ username: 'missing', password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

function createUser(): User {
  return {
    id: 1,
    username: 'user',
    email: 'user@example.com',
    passwordHash: 'hidden',
    role: UserRole.USER,
    createdWorkshops: [],
    bookings: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
