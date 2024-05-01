import { IEntityBase } from '../utils/entity-base.interface';
import { IEdorg } from './edorg.interface';
import { IOds } from './ods.interface';
import { IRole } from './role.interface';
import { IEdfiTenant } from './edfi-tenant.interface';
import { ITeam } from './team.interface';
import { ISbEnvironment } from './sb-environment.interface';

export interface IOwnership extends IEntityBase {
  team: ITeam;
  teamId: ITeam['id'];
  role: IRole | null;
  roleId: IRole['id'] | null;

  sbEnvironment?: ISbEnvironment;
  sbEnvironmentId?: number;

  edfiTenant?: IEdfiTenant;
  edfiTenantId?: number;

  ods?: IOds;
  odsId?: number;

  edorg?: IEdorg;
  edorgId?: number;
}

export interface IOwnershipView {
  id: IOwnership['id'];
  teamId: ITeam['id'];
  roleId: IRole['id'] | null;
  resourceType: 'Edorg' | 'Ods' | 'EdfiTenant' | 'SbEnvironment';
  resourceText: string;
}
