import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Booking } from '../bookings/booking.entity';
import { User } from '../users/user.entity';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import { Workshop } from './workshop.entity';
import { WorkshopResponse } from './workshop-response.interface';

@Injectable()
export class WorkshopsService {
  constructor(
    @InjectRepository(Workshop)
    private readonly workshopsRepository: Repository<Workshop>,
    @InjectRepository(Booking)
    private readonly bookingsRepository: Repository<Booking>,
  ) {}

  async findAll(): Promise<WorkshopResponse[]> {
    const workshops = await this.baseQuery()
      .orderBy('workshop.startsAt', 'ASC')
      .addOrderBy('workshop.title', 'ASC')
      .getMany();

    return workshops.map((workshop) => this.toResponse(workshop));
  }

  async findOne(id: number): Promise<WorkshopResponse> {
    return this.toResponse(await this.findEntity(id));
  }

  async create(
    dto: CreateWorkshopDto,
    createdBy: Pick<User, 'id'>,
  ): Promise<WorkshopResponse> {
    const workshop = await this.workshopsRepository.save(
      this.workshopsRepository.create({
        title: dto.title,
        description: dto.description,
        startsAt: new Date(dto.starts_at),
        durationMinutes: dto.duration_minutes,
        capacity: dto.capacity,
        createdBy,
      }),
    );

    return this.findOne(workshop.id);
  }

  async update(id: number, dto: UpdateWorkshopDto): Promise<WorkshopResponse> {
    const workshop = await this.findEntity(id);

    if (dto.capacity !== undefined) {
      const bookingsCount = await this.bookingsRepository.count({
        where: { workshop: { id } },
      });
      if (dto.capacity < bookingsCount) {
        throw new BadRequestException(
          'Вместимость не может быть меньше количества существующих бронирований',
        );
      }
    }

    if (dto.title !== undefined) workshop.title = dto.title;
    if (dto.description !== undefined) workshop.description = dto.description;
    if (dto.starts_at !== undefined)
      workshop.startsAt = new Date(dto.starts_at);
    if (dto.duration_minutes !== undefined) {
      workshop.durationMinutes = dto.duration_minutes;
    }
    if (dto.capacity !== undefined) workshop.capacity = dto.capacity;

    await this.workshopsRepository.save(workshop);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.workshopsRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException('Мастер-класс не найден');
    }
  }

  private baseQuery() {
    return this.workshopsRepository
      .createQueryBuilder('workshop')
      .leftJoinAndSelect('workshop.createdBy', 'createdBy');
  }

  private async findEntity(id: number): Promise<Workshop> {
    const workshop = await this.baseQuery()
      .where('workshop.id = :id', { id })
      .getOne();

    if (!workshop) {
      throw new NotFoundException('Мастер-класс не найден');
    }
    return workshop;
  }

  private toResponse(workshop: Workshop): WorkshopResponse {
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
