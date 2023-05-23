import { IEntityBase } from '../utils/entity-base.interface';
import { IEdorg } from './edorg.interface';
import { IOds } from './ods.interface';
import { IRole } from './role.interface';
import { ISbe } from './sbe.interface';
import { ITenant } from './tenant.interface';

export interface IOwnership extends IEntityBase {
  tenant: ITenant;
  tenantId: ITenant['id'];
  role: IRole;
  roleId: IRole['id'];

  sbe?: ISbe;
  sbeId?: number;

  ods?: IOds;
  odsId?: number;

  edorg?: IEdorg;
  edorgId?: number;
}
