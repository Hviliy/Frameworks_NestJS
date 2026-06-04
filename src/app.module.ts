import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { databaseConfig } from './database/typeorm.config';
import { UsersModule } from './users/users.module';
import { WorkshopsModule } from './workshops/workshops.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: databaseConfig,
    }),
    AuthModule,
    UsersModule,
    WorkshopsModule,
    BookingsModule,
  ],
})
export class AppModule {}
