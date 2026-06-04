import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';

import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { AuthUser } from './auth-user.interface';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthUser> {
    const user = await this.usersService.create({
      username: dto.username,
      email: dto.email,
      passwordHash: await hash(dto.password, 12),
    });

    return this.toAuthUser(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByUsernameWithPassword(
      dto.username,
    );

    if (!user || !(await compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Неверное имя пользователя или пароль');
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: this.toAuthUser(user),
    };
  }

  toAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }
}
