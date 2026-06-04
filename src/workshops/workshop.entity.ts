import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Booking } from '../bookings/booking.entity';
import { User } from '../users/user.entity';

@Entity('workshops')
@Check('CHK_workshops_capacity', '"capacity" >= 1')
@Check('CHK_workshops_duration', '"duration_minutes" >= 1')
export class Workshop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'starts_at', type: 'datetime' })
  startsAt: Date;

  @Column({ name: 'duration_minutes', type: 'integer' })
  durationMinutes: number;

  @Column({ type: 'integer' })
  capacity: number;

  @ManyToOne(() => User, (user) => user.createdWorkshops, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'created_by_id',
    foreignKeyConstraintName: 'FK_workshops_created_by',
  })
  createdBy: User | null;

  @OneToMany(() => Booking, (booking) => booking.workshop)
  bookings: Booking[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
