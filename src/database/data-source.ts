import 'dotenv/config';
import { DataSource } from 'typeorm';

import { Booking } from '../bookings/booking.entity';
import { User } from '../users/user.entity';
import { Workshop } from '../workshops/workshop.entity';

export default new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE_PATH ?? 'data/workshop-booking.sqlite',
  entities: [User, Workshop, Booking],
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  synchronize: false,
});
