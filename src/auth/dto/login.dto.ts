import { IsString, Length } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'Имя пользователя должно быть строкой' })
  @Length(1, 150, {
    message: 'Имя пользователя должно содержать от 1 до 150 символов',
  })
  username: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @Length(1, 128, {
    message: 'Пароль должен содержать от 1 до 128 символов',
  })
  password: string;
}
