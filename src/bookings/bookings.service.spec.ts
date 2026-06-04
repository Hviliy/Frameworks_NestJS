import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { AuthUser } from '../auth/auth-user.interface';
import { UserRole } from '../users/user-role.enum';
import { User } from '../users/user.entity';
import { Workshop } from '../workshops/workshop.entity';
import { WorkshopsService } from '../workshops/workshops.service';
import { Booking } from './booking.entity';
import { BookingsService } from './bookings.service';

describe('BookingsService', () => {
  let dataSource: DataSource;
  let usersRepository: Repository<User>;
  let workshopsRepository: Repository<Workshop>;
  let bookingsRepository: Repository<Booking>;
  let service: BookingsService;
  let workshopsService: WorkshopsService;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      entities: [User, Workshop, Booking],
      synchronize: true,
    });
    await dataSource.initialize();

    usersRepository = dataSource.getRepository(User);
    workshopsRepository = dataSource.getRepository(Workshop);
    bookingsRepository = dataSource.getRepository(Booking);
    service = new BookingsService(
      bookingsRepository,
      workshopsRepository,
      dataSource,
    );
    workshopsService = new WorkshopsService(
      workshopsRepository,
      bookingsRepository,
    );
  });

  beforeEach(async () => {
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('создаёт бронь и возвращает данные мастер-класса', async () => {
    const user = await createUser('user');
    const workshop = await createWorkshop();

    const result = await service.create(
      { workshop: workshop.id },
      toAuth(user),
    );

    expect(result.workshop).toBe(workshop.id);
    expect(result.workshop_detail.title).toBe(workshop.title);
    expect(result).not.toHaveProperty('user');
  });

  it('запрещает повторное бронирование', async () => {
    const user = await createUser('user');
    const workshop = await createWorkshop();
    await service.create({ workshop: workshop.id }, toAuth(user));

    await expect(
      service.create({ workshop: workshop.id }, toAuth(user)),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('запрещает бронирование при отсутствии свободных мест', async () => {
    const firstUser = await createUser('first');
    const secondUser = await createUser('second');
    const workshop = await createWorkshop(1);
    await service.create({ workshop: workshop.id }, toAuth(firstUser));

    await expect(
      service.create({ workshop: workshop.id }, toAuth(secondUser)),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('запрещает бронирование мастер-класса с прошедшей датой', async () => {
    const user = await createUser('user');
    const workshop = await createWorkshop(
      10,
      new Date(Date.now() - 86_400_000),
    );

    await expect(
      service.create({ workshop: workshop.id }, toAuth(user)),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('показывает пользователю только его бронирования', async () => {
    const firstUser = await createUser('first');
    const secondUser = await createUser('second');
    const workshop = await createWorkshop();
    await service.create({ workshop: workshop.id }, toAuth(firstUser));
    const secondBooking = await service.create(
      { workshop: workshop.id },
      toAuth(secondUser),
    );

    const firstUserBookings = await service.findAll(toAuth(firstUser));

    expect(firstUserBookings).toHaveLength(1);
    await expect(
      service.findOne(secondBooking.id, toAuth(firstUser)),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('запрещает уменьшать вместимость ниже количества броней', async () => {
    const firstUser = await createUser('first');
    const secondUser = await createUser('second');
    const workshop = await createWorkshop(3);
    await service.create({ workshop: workshop.id }, toAuth(firstUser));
    await service.create({ workshop: workshop.id }, toAuth(secondUser));

    await expect(
      workshopsService.update(workshop.id, { capacity: 1 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  async function createUser(username: string, role = UserRole.USER) {
    return usersRepository.save(
      usersRepository.create({
        username,
        email: `${username}@example.com`,
        passwordHash: 'hidden',
        role,
      }),
    );
  }

  async function createWorkshop(
    capacity = 10,
    startsAt = new Date(Date.now() + 86_400_000),
  ) {
    return workshopsRepository.save(
      workshopsRepository.create({
        title: 'NestJS мастер-класс',
        description: 'Описание',
        startsAt,
        durationMinutes: 90,
        capacity,
        createdBy: null,
      }),
    );
  }
});

function toAuth(user: User): AuthUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
}
