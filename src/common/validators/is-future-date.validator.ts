import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string): void => {
    registerDecorator({
      name: 'isFutureDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') {
            return false;
          }
          const timestamp = Date.parse(value);
          return Number.isFinite(timestamp) && timestamp > Date.now();
        },
        defaultMessage(args: ValidationArguments): string {
          return `Поле "${args.property}" должно содержать будущую дату`;
        },
      },
    });
  };
}
