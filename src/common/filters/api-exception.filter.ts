import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

const STATUS_ERRORS: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'Некорректный запрос',
  [HttpStatus.UNAUTHORIZED]: 'Необходима авторизация',
  [HttpStatus.FORBIDDEN]: 'Доступ запрещён',
  [HttpStatus.NOT_FOUND]: 'Ресурс не найден',
  [HttpStatus.CONFLICT]: 'Конфликт данных',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Внутренняя ошибка сервера',
};

const MESSAGE_TRANSLATIONS: Record<string, string> = {
  Unauthorized: 'Необходима авторизация',
  'Forbidden resource': 'Недостаточно прав для выполнения операции',
  'Internal server error': 'Внутренняя ошибка сервера',
  'Validation failed (numeric string is expected)':
    'Идентификатор должен быть целым числом',
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    response.status(status).json({
      statusCode: status,
      message: this.getMessages(exceptionResponse, status),
      error: STATUS_ERRORS[status] ?? 'Ошибка запроса',
    });
  }

  private getMessages(response: string | object | null, status: number) {
    if (typeof response === 'string') {
      return this.translate(response);
    }

    if (response && 'message' in response) {
      const message = (response as { message: string | string[] }).message;
      return Array.isArray(message)
        ? message.map((item) => this.translate(item))
        : this.translate(message);
    }

    return STATUS_ERRORS[status] ?? 'Произошла ошибка';
  }

  private translate(message: string): string {
    const forbiddenProperty = message.match(/^property (.+) should not exist$/);
    if (forbiddenProperty) {
      return `Поле "${forbiddenProperty[1]}" не разрешено`;
    }

    if (/^Cannot (GET|POST|PUT|PATCH|DELETE) /.test(message)) {
      return 'Запрошенный маршрут не найден';
    }

    return MESSAGE_TRANSLATIONS[message] ?? message;
  }
}
