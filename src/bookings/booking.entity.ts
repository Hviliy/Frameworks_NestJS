import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { User } from '../users/user.entity';
import { Workshop } from '../workshops/workshop.entity';

@Entity('bookings')
@Unique('UQ_bookings_user_workshop', ['user', 'workshop'])
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.bookings, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @Index('IDX_bookings_user_id')
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_bookings_user',
  })
  user: User;

  @ManyToOne(() => Workshop, (workshop) => workshop.bookings, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @Index('IDX_bookings_workshop_id')
  @JoinColumn({
    name: 'workshop_id',
    foreignKeyConstraintName: 'FK_bookings_workshop',
  })
  workshop: Workshop;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
