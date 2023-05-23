import { Expose, Type } from 'class-transformer';
import {
  ISbe,
  ISbeConfigPrivate,
  ISbeConfigPublic,
} from '../interfaces/sbe.interface';
import { DtoGetBase, GetDto } from '../utils/get-base.dto';
import { makeSerializer } from '../utils/make-serializer';
import { DtoPostBase, PostDto } from '../utils/post-base.dto';
import { DtoPutBase, PutDto } from '../utils/put-base.dto';
import { stdDetailed, stdShort } from '@edanalytics/utils';
export class GetSbeConfigPublic implements ISbeConfigPublic {
  @Expose()
  hasOdsRefresh: false;
  @Expose()
  lastSuccessfulConnectionSbMeta?: Date;
  @Expose()
  lastFailedConnectionSbMeta?: Date;
  @Expose()
  lastSuccessfulConnectionAdminApi?: Date;
  @Expose()
  lastFailedConnectionAdminApi?: Date;
  @Expose()
  lastSuccessfulPull?: Date;
  @Expose()
  lastFailedPull?: Date;

  get lastSuccessfulConnectionSbMetaLong() {
    return stdDetailed(this.lastSuccessfulConnectionSbMeta);
  }
  get lastFailedConnectionSbMetaLong() {
    return stdDetailed(this.lastFailedConnectionSbMeta);
  }
  get lastSuccessfulConnectionAdminApiLong() {
    return stdDetailed(this.lastSuccessfulConnectionAdminApi);
  }
  get lastFailedConnectionAdminApiLong() {
    return stdDetailed(this.lastFailedConnectionAdminApi);
  }
  get lastSuccessfulPullLong() {
    return stdDetailed(this.lastSuccessfulPull);
  }
  get lastFailedPullLong() {
    return stdDetailed(this.lastFailedPull);
  }
}

export class SbeConfigPrivate implements ISbeConfigPrivate {
  @Expose()
  adminApiUrl: string;
  @Expose()
  adminApiKey: string;
  @Expose()
  adminApiSecret: string;
  @Expose()
  sbeMetaUrl: string;
  @Expose()
  sbeMetaKey: string;
  @Expose()
  sbeMetaSecret: string;
}

export class GetSbeDto
  extends DtoGetBase
  implements GetDto<ISbe, 'ownerships' | 'odss' | 'edorgs' | 'configPrivate'>
{
  @Expose()
  envLabel: string;
  @Expose()
  @Type(() => GetSbeConfigPublic)
  configPublic: GetSbeConfigPublic;

  override get displayName() {
    return this.envLabel;
  }
}
export const toGetSbeDto = makeSerializer<GetSbeDto, ISbe>(GetSbeDto);

export class PutSbeDto
  extends DtoPutBase
  implements
    PutDto<
      ISbe,
      'ownerships' | 'odss' | 'edorgs' | 'configPrivate' | 'configPublic'
    >
{
  @Expose()
  envLabel: string;
  @Expose()
  @Type(() => SbeConfigPrivate)
  configPrivate?: SbeConfigPrivate;
}

export class PostSbeDto
  extends DtoPostBase
  implements
    PostDto<
      ISbe,
      'ownerships' | 'odss' | 'edorgs' | 'configPrivate' | 'configPublic'
    >
{
  @Expose()
  envLabel: string;
  @Expose()
  @Type(() => SbeConfigPrivate)
  configPrivate?: SbeConfigPrivate;
}

export class SbeCheckConnectionDto {
  @Expose()
  id: number;

  @Expose()
  adminApi: boolean;

  @Expose()
  sbMeta: boolean;
}
export const toSbeCCDto = makeSerializer(SbeCheckConnectionDto);

export class SbeRefreshResourcesDto {
  @Expose()
  id: number;

  @Expose()
  odsCount: number;

  @Expose()
  edorgCount: number;
}
export const toSbeRRDto = makeSerializer(SbeRefreshResourcesDto);
