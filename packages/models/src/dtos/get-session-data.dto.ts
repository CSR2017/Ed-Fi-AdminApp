import { Expose } from 'class-transformer';
import { Type } from 'class-transformer';
import { GetUserDto } from './get-user.dto';

export class GetSessionDataDto {
  @Expose()
  @Type(() => GetUserDto)
  user: GetUserDto;
}

import { makeSerializer } from '../utils/make-serializer';
export const toGetSessionDataDto = makeSerializer(GetSessionDataDto);
