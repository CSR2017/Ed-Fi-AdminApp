import { IOwnership } from '.';
import { IEntityBase } from '../utils/entity-base.interface';
import { IEdorg } from './edorg.interface';
import { ISbe } from './sbe.interface';

export interface IOds extends IEntityBase {
  ownerships: IOwnership[];

  sbe: ISbe;
  sbeId: number;

  dbName: string;
  edorgs: IEdorg[];
}
