import { validate } from 'class-validator';

import { CreateWorkshopDto } from './create-workshop.dto';

describe('CreateWorkshopDto', () => {
  it('принимает корректный мастер-класс с будущей датой', async () => {
    const dto = createDto(new Date(Date.now() + 86_400_000).toISOString());

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('отклоняет мастер-класс с прошедшей датой', async () => {
    const dto = createDto(new Date(Date.now() - 86_400_000).toISOString());

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'starts_at')).toBe(true);
  });
});

function createDto(startsAt: string): CreateWorkshopDto {
  const dto = new CreateWorkshopDto();
  dto.title = 'NestJS workshop';
  dto.description = 'Workshop description';
  dto.starts_at = startsAt;
  dto.duration_minutes = 90;
  dto.capacity = 10;
  return dto;
}
