import { ClassConstructor, plainToInstance } from 'class-transformer';
import { GettersOmit } from './dto-get-base';

export const makeSerializer = <T>(dto: ClassConstructor<T>) => {
  function serialize<P extends T>(input: Omit<P, GettersOmit>): T;
  function serialize<P extends T>(input: Omit<P, GettersOmit>[]): T[];
  function serialize<P extends T>(input: Omit<P, GettersOmit> | P[]) {
    if (Array.isArray(input)) {
      return plainToInstance(dto, input, { excludeExtraneousValues: true });
    } else {
      return plainToInstance(dto, input, { excludeExtraneousValues: true });
    }
  }

  return serialize;
};
