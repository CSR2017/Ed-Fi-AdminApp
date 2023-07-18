import { IOwnership } from '.';
import { EdorgType } from '../enums/edorg-type.enum';
import { IEntityBase } from '../utils/entity-base.interface';
import { IOds } from './ods.interface';
import { ISbe } from './sbe.interface';

export interface IEdorg extends IEntityBase {
  ownerships: IOwnership[];

  sbe: ISbe;
  sbeId: number;
  ods: IOds;
  odsId: number;
  odsDbName: string;

  children: IEdorg[];
  parent?: IEdorg;
  parentId?: number;

  educationOrganizationId: number;
  nameOfInstitution: string;
  shortNameOfInstitution: string;
  discriminator: EdorgType;
}
