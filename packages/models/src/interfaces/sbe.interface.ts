import { IOwnership } from '.';
import { IEntityBase } from '../utils/entity-base.interface';
import { IEdorg } from './edorg.interface';
import { IOds } from './ods.interface';

export interface ISbeConfigPublic {
  hasOdsRefresh: false;
  lastSuccessfulConnectionSbMeta?: Date;
  lastFailedConnectionSbMeta?: Date;
  lastSuccessfulConnectionAdminApi?: Date;
  lastFailedConnectionAdminApi?: Date;
  lastSuccessfulPull?: Date;
  lastFailedPull?: Date;
}

export interface ISbeConfigPrivate {
  adminApiUrl: string;
  adminApiKey: string;
  adminApiSecret: string;

  sbeMetaUrl: string;
  sbeMetaKey: string;
  sbeMetaSecret: string;
}
export interface ISbe extends IEntityBase {
  ownerships: IOwnership[];

  odss: IOds[];
  edorgs: IEdorg[];

  envLabel: string;
  configPublic: ISbeConfigPublic;
  configPrivate: ISbeConfigPrivate;
}
