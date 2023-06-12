import { Expose, Type } from 'class-transformer';
import { makeSerializer } from '../utils/make-serializer';
import { GetRoleDto } from './role.dto';
import { GetTenantDto } from './tenant.dto';
import { GetUserTenantMembershipDto } from './user-tenant-membership.dto';
import { GetUserDto } from './user.dto';
export class GetSessionDataDtoUtm extends GetUserTenantMembershipDto {
  @Expose()
  @Type(() => GetRoleDto)
  role: GetRoleDto;
  @Expose()
  @Type(() => GetTenantDto)
  tenant: GetTenantDto;
}
export class GetSessionDataDto extends GetUserDto {
  @Expose()
  @Type(() => GetSessionDataDtoUtm)
  userTenantMemberships: GetSessionDataDtoUtm[];

  @Expose()
  @Type(() => GetRoleDto)
  role: GetRoleDto;
}

export const toGetSessionDataDto = makeSerializer(GetSessionDataDto);
