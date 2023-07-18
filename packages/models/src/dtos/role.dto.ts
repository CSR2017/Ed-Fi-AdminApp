import { Expose, Transform, Type } from 'class-transformer';
import { IsEnum, IsIn, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { RoleType } from '../enums';
import { IPrivilege, ITenant } from '../interfaces';
import { IRole } from '../interfaces/role.interface';
import { PrivilegeCode, privilegeCodes } from '../types';
import { DtoGetBase, GetDto } from '../utils/get-base.dto';
import { makeSerializer } from '../utils/make-serializer';
import { DtoPostBase, PostDto } from '../utils/post-base.dto';
import { DtoPutBase, PutDto } from '../utils/put-base.dto';
import { GetPrivilegeDto } from './privilege.dto';
import { IsValidPrivileges } from '../utils';

export class GetRoleDto extends DtoGetBase implements GetDto<IRole, 'tenant'> {
  @Expose()
  name: string;
  @Expose()
  description?: string;
  @Expose()
  @Transform(({ value }) => (value === null ? undefined : value))
  tenantId?: ITenant['id'];
  @Expose()
  type: RoleType;
  @Expose()
  @Type(() => GetPrivilegeDto)
  privileges: IPrivilege[];

  override get displayName() {
    return this.name;
  }
}
export const toGetRoleDto = makeSerializer(GetRoleDto);

export class PutRoleDto
  extends DtoPutBase
  implements PutDto<IRole, 'tenant' | 'type' | 'tenantId' | 'privileges'>
{
  @Expose()
  @IsString()
  @MinLength(3)
  name: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsIn(privilegeCodes, { each: true })
  @IsValidPrivileges()
  privileges: string[];
}

export class PostRoleDto extends DtoPostBase implements PostDto<IRole, 'tenant' | 'privileges'> {
  @Expose()
  @IsOptional()
  @IsNumber()
  tenantId?: ITenant['id'];

  @Expose()
  @IsEnum(RoleType)
  type: RoleType;

  @Expose()
  @IsString()
  @MinLength(3)
  name: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsIn(privilegeCodes, { each: true })
  @IsValidPrivileges()
  privileges: string[];
}
