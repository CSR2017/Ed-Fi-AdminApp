import { Expose } from 'class-transformer';

export class Id {
  @Expose()
  id: number;
}
