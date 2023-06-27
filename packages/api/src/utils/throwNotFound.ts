import { NotFoundException } from '@nestjs/common';

export const throwNotFound = (err: any) => {
  console.log(err);
  throw new NotFoundException();
};

export const throwNotFoundText = (text: string) => (err: any) => {
  console.log(err);
  throw new NotFoundException(text);
};
