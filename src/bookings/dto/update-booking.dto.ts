import { IsInt, Min } from 'class-validator';

export class UpdateBookingDto {
  @IsInt({ message: 'Идентификатор мастер-класса должен быть целым числом' })
  @Min(1, { message: 'Идентификатор мастер-класса должен быть не меньше 1' })
  workshop: number;
}
