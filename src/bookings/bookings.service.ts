import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  Not,
  QueryFailedError,
  Repository,
} from 'typeorm';

import { AuthUser } from '../auth/auth-user.interface';
import { UserRole } from '../users/user-role.enum';
import { Workshop } from '../workshops/workshop.entity';
import { WorkshopResponse } from '../workshops/workshop-response.interface';
import { Booking } from './booking.entity';
import { BookingResponse } from './booking-response.interface';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingsRepository: Repository<Booking>,
    @InjectRepository(Workshop)
    private readonly workshopsRepository: Repository<Workshop>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(user: AuthUser): Promise<BookingResponse[]> {
    const query = this.baseQuery().orderBy('booking.createdAt', 'DESC');

    if (user.role !== UserRole.ADMIN) {
      query.where('booking.user_id = :userId', { userId: user.id });
    }

    return (await query.getMany()).map((booking) => this.toResponse(booking));
  }

  async findOne(id: number, user: AuthUser): Promise<BookingResponse> {
    return this.toResponse(await this.findAccessibleEntity(id, user));
  }

  async create(
    dto: CreateBookingDto,
    user: AuthUser,
  ): Promise<BookingResponse> {
    const bookingId = await this.dataSource.transaction(async (manager) => {
      const workshop = await this.findWorkshop(manager, dto.workshop);
      await this.validateBooking(manager, user.id, workshop);

      try {
        const booking = manager.create(Booking, {
          user: { id: user.id },
          workshop,
        });
        return (await manager.save(booking)).id;
      } catch (error) {
        this.handleSaveError(error);
      }
    });

    return this.findOne(bookingId, user);
  }

  async update(
    id: number,
    dto: UpdateBookingDto,
    user: AuthUser,
  ): Promise<BookingResponse> {
    await this.findAccessibleEntity(id, user);

    await this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(Booking, {
        where: { id },
        relations: { user: true },
      });
      if (!booking) {
        throw new NotFoundException('Бронирование не найдено');
      }

      const workshop = await this.findWorkshop(manager, dto.workshop);
      await this.validateBooking(manager, booking.user.id, workshop, id);
      booking.workshop = workshop;

      try {
        await manager.save(booking);
      } catch (error) {
        this.handleSaveError(error);
      }
    });

    return this.findOne(id, user);
  }

  async remove(id: number, user: AuthUser): Promise<void> {
    const query = this.bookingsRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id });

    if (user.role !== UserRole.ADMIN) {
      query.andWhere('user_id = :userId', { userId: user.id });
    }

    const result = await query.execute();
    if (!result.affected) {
      throw new NotFoundException('Бронирование не найдено');
    }
  }

  private baseQuery() {
    return this.bookingsRepository
      .createQueryBuilder('booking')
      .innerJoinAndSelect('booking.user', 'user')
      .innerJoinAndSelect('booking.workshop', 'workshop')
      .leftJoinAndSelect('workshop.createdBy', 'createdBy');
  }

  private async findAccessibleEntity(id: number, user: AuthUser) {
    const query = this.baseQuery().where('booking.id = :id', { id });

    if (user.role !== UserRole.ADMIN) {
      query.andWhere('booking.user_id = :userId', { userId: user.id });
    }

    const booking = await query.getOne();
    if (!booking) {
      throw new NotFoundException('Бронирование не найдено');
    }
    return booking;
  }

  private async findWorkshop(manager: EntityManager, id: number) {
    const workshop = await manager.findOne(Workshop, {
      where: { id },
      relations: { createdBy: true },
    });
    if (!workshop) {
      throw new NotFoundException('Мастер-класс не найден');
    }
    return workshop;
  }

  private async validateBooking(
    manager: EntityManager,
    userId: number,
    workshop: Workshop,
    excludeBookingId?: number,
  ): Promise<void> {
    if (workshop.startsAt.getTime() <= Date.now()) {
      throw new BadRequestException(
        'Нельзя забронировать мастер-класс с прошедшей датой',
      );
    }

    const duplicateCount = await manager.count(Booking, {
      where: {
        id: excludeBookingId ? Not(excludeBookingId) : undefined,
        user: { id: userId },
        workshop: { id: workshop.id },
      },
    });
    if (duplicateCount > 0) {
      throw new ConflictException('Вы уже забронировали этот мастер-класс');
    }

    const bookingsCount = await manager.count(Booking, {
      where: {
        id: excludeBookingId ? Not(excludeBookingId) : undefined,
        workshop: { id: workshop.id },
      },
    });
    if (bookingsCount >= workshop.capacity) {
      throw new BadRequestException(
        'На этот мастер-класс больше нет свободных мест',
      );
    }
  }

  private handleSaveError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      throw new ConflictException('Вы уже забронировали этот мастер-класс');
    }
    throw error;
  }

  private toResponse(booking: Booking): BookingResponse {
    return {
      id: booking.id,
      workshop: booking.workshop.id,
      workshop_detail: this.toWorkshopResponse(booking.workshop),
      created_at: booking.createdAt,
    };
  }

  private toWorkshopResponse(workshop: Workshop): WorkshopResponse {
    return {
      id: workshop.id,
      title: workshop.title,
      description: workshop.description,
      starts_at: workshop.startsAt,
      duration_minutes: workshop.durationMinutes,
      capacity: workshop.capacity,
      created_by: workshop.createdBy?.username ?? null,
      created_at: workshop.createdAt,
      updated_at: workshop.updatedAt,
    };
  }
}
