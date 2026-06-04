import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'Имя пользователя должно быть строкой' })
  @Length(3, 150, {
    message: 'Имя пользователя должно содержать от 3 до 150 символов',
  })
  @Matches(/^[\w.@+-]+$/, {
    message: 'Имя пользователя содержит недопустимые символы',
  })
  username: string;

  @IsEmail({}, { message: 'Введите корректный адрес электронной почты' })
  @Length(3, 254, {
    message: 'Адрес электронной почты должен содержать от 3 до 254 символов',
  })
  email: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @Length(8, 128, {
    message: 'Пароль должен содержать от 8 до 128 символов',
  })
  password: string;
}
