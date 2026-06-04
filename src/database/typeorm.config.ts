import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { Booking } from '../bookings/booking.entity';
import { User } from '../users/user.entity';
import { Workshop } from '../workshops/workshop.entity';

export function databaseConfig(
  configService: ConfigService,
): TypeOrmModuleOptions {
  return {
    type: 'sqlite',
    database: configService.get<string>(
      'DATABASE_PATH',
      'data/workshop-booking.sqlite',
    ),
    entities: [User, Workshop, Booking],
    migrations: [`${__dirname}/migrations/*{.ts,.js}`],
    migrationsRun: true,
    synchronize: false,
  };
}
