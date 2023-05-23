import { Expose, Type } from 'class-transformer';
import { IRole, ITenant } from '../interfaces';
import { IOwnership } from '../interfaces/ownership.interface';
import { DtoGetBase, GetDto } from '../utils/get-base.dto';
import { makeSerializer } from '../utils/make-serializer';
import { DtoPostBase, PostDto } from '../utils/post-base.dto';
import { DtoPutBase, PutDto } from '../utils/put-base.dto';
import { GetEdorgDto } from './edorg.dto';
import { GetOdsDto } from './ods.dto';
import { GetSbeDto } from './sbe.dto';

export class GetOwnershipDto
  extends DtoGetBase
  implements
    GetDto<
      IOwnership,
      | 'tenant'
      | 'role'
      | 'sbeId'
      | 'sbe'
      | 'odsId'
      | 'ods'
      | 'edorgId'
      | 'edorg'
    >
{
  @Expose()
  tenantId: ITenant['id'];
  @Expose()
  roleId: IRole['id'];

  @Expose()
  @Type(() => GetSbeDto)
  sbe?: GetSbeDto;

  @Expose()
  @Type(() => GetOdsDto)
  ods?: GetOdsDto;

  @Expose()
  @Type(() => GetEdorgDto)
  edorg?: GetEdorgDto;
}
export const toGetOwnershipDto = makeSerializer<GetOwnershipDto, IOwnership>(
  GetOwnershipDto
);

export class PutOwnershipDto
  extends DtoPutBase
  implements
    PutDto<
      IOwnership,
      | 'tenant'
      | 'tenantId'
      | 'role'
      | 'sbeId'
      | 'sbe'
      | 'odsId'
      | 'ods'
      | 'edorgId'
      | 'edorg'
    >
{
  @Expose()
  roleId: IRole['id'];
}

export class PostOwnershipDto
  extends DtoPostBase
  implements
    PostDto<
      IOwnership,
      | 'tenant'
      | 'role'
      | 'sbeId'
      | 'sbe'
      | 'odsId'
      | 'ods'
      | 'edorgId'
      | 'edorg'
    >
{
  @Expose()
  tenantId: ITenant['id'];
  @Expose()
  roleId: IRole['id'];

  @Expose()
  @Type(() => GetSbeDto)
  sbe?: GetSbeDto;

  @Expose()
  @Type(() => GetOdsDto)
  ods?: GetOdsDto;

  @Expose()
  @Type(() => GetEdorgDto)
  edorg?: GetEdorgDto;
}
