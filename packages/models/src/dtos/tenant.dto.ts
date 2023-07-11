import { Expose } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';
import { ITenant } from '../interfaces/tenant.interface';
import { DtoGetBase, GetDto } from '../utils/get-base.dto';
import { makeSerializer } from '../utils/make-serializer';
import { DtoPostBase, PostDto } from '../utils/post-base.dto';
import { DtoPutBase, PutDto } from '../utils/put-base.dto';

export class GetTenantDto
  extends DtoGetBase
  implements GetDto<ITenant, 'userTenantMemberships' | 'ownerships' | 'roles'>
{
  @Expose()
  name: string;

  override get displayName() {
    return this.name;
  }
}
export const toGetTenantDto = makeSerializer(GetTenantDto);

export class PutTenantDto
  extends DtoPutBase
  implements PutDto<ITenant, 'userTenantMemberships' | 'ownerships' | 'roles'>
{
  @Expose()
  @IsString()
  @MinLength(3)
  name: string;
}

export class PostTenantDto
  extends DtoPostBase
  implements PostDto<ITenant, 'userTenantMemberships' | 'ownerships' | 'roles'>
{
  @Expose()
  @IsString()
  @MinLength(3)
  name: string;
}
