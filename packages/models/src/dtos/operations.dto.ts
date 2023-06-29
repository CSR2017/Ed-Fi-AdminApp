import { Expose, Type } from 'class-transformer';
import { makeSerializer } from '../utils';

export class OperationResultDto {
  @Expose()
  title: string;

  @Expose()
  id: string | number;

  @Expose()
  @Type(() => OperationStatusDto)
  statuses: OperationStatusDto[];

  @Expose()
  messages: string[];
}

export const toOperationResultDto = makeSerializer(OperationResultDto);

export class OperationStatusDto {
  @Expose()
  name: string;

  @Expose()
  success: boolean;
}
