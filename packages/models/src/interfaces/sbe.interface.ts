import { IOwnership } from '.';
import { IEntityBase } from '../utils/entity-base.interface';
import { IEdorg } from './edorg.interface';
import { IOds } from './ods.interface';

export interface ISbeConfigPublic {
  hasOdsRefresh?: false;
  lastSuccessfulConnectionSbMeta?: Date;
  lastFailedConnectionSbMeta?: Date;
  lastSuccessfulConnectionAdminApi?: Date;
  lastFailedConnectionAdminApi?: Date;
  lastSuccessfulPull?: Date;
  lastFailedPull?: Date;
  adminApiUrl?: string;
  adminApiKey?: string;
  adminApiClientDisplayName?: string;
  sbeMetaUrl?: string;
  sbeMetaKey?: string;
}

export interface ISbeConfigPrivate {
  adminApiSecret: string;
  sbeMetaSecret: string;
}
export interface ISbe extends IEntityBase {
  ownerships: IOwnership[];

  odss: IOds[];
  edorgs: IEdorg[];

  envLabel: string;
  configPublic: ISbeConfigPublic | null;
  configPrivate: ISbeConfigPrivate | null;
}
