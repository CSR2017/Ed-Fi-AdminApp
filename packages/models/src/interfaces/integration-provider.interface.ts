import { IEntityBase } from '../utils/entity-base.interface';
import { IOwnership } from './ownership.interface';

export interface IIntegrationProvider extends IEntityBase {
  name: string;
  description: string;
  ownerships: IOwnership[];
}
