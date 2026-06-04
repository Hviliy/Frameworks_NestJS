import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Booking } from '../bookings/booking.entity';
import { Workshop } from './workshop.entity';
import { WorkshopsController } from './workshops.controller';
import { WorkshopsService } from './workshops.service';

@Module({
  imports: [TypeOrmModule.forFeature([Workshop, Booking])],
  controllers: [WorkshopsController],
  providers: [WorkshopsService],
  exports: [TypeOrmModule, WorkshopsService],
})
export class WorkshopsModule {}
