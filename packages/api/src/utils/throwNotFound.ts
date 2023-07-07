import { Logger, NotFoundException } from '@nestjs/common';

export const throwNotFound = (err: any) => {
  Logger.log(err);
  throw new NotFoundException();
};

export const throwNotFoundText = (text: string) => (err: any) => {
  Logger.log(err);
  throw new NotFoundException(text);
};
