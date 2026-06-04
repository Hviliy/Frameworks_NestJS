import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

import { IsFutureDate } from '../../common/validators/is-future-date.validator';

export class UpdateWorkshopDto {
  @IsOptional()
  @IsString({ message: 'Название должно быть строкой' })
  @Length(1, 255, {
    message: 'Название должно содержать от 1 до 255 символов',
  })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  @Length(1, 10000, {
    message: 'Описание должно содержать от 1 до 10000 символов',
  })
  description?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Дата начала должна быть в формате ISO 8601' })
  @IsFutureDate()
  starts_at?: string;

  @IsOptional()
  @IsInt({ message: 'Продолжительность должна быть целым числом' })
  @Min(1, { message: 'Продолжительность должна быть не меньше 1 минуты' })
  duration_minutes?: number;

  @IsOptional()
  @IsInt({ message: 'Вместимость должна быть целым числом' })
  @Min(1, { message: 'Вместимость должна быть не меньше 1' })
  capacity?: number;
}
