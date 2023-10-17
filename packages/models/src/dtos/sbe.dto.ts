import { Expose, Type } from 'class-transformer';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { ISbe, ISbeConfigPrivate, ISbeConfigPublic } from '../interfaces/sbe.interface';
import { DtoPutBase, IsArn, PutDto } from '../utils';
import { DtoGetBase, GetDto } from '../utils/get-base.dto';
import { makeSerializer } from '../utils/make-serializer';
import { DtoPostBase, PostDto } from '../utils/post-base.dto';
export class GetSbeConfigPublic implements ISbeConfigPublic {
  @Expose()
  edfiHostname?: string;
  @Expose()
  adminApiUrl?: string;
  @Expose()
  adminApiKey?: string;
  @Expose()
  adminApiClientDisplayName?: string | undefined;
  @Expose()
  sbeMetaArn?: string;
  @Expose()
  sbeMetaKey?: string;
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
}

export class SbeConfigPrivate implements ISbeConfigPrivate {
  @Expose()
  adminApiSecret: string;
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

  @Expose()
  name: string;

  override get displayName() {
    return this.name;
  }
}
export const toGetSbeDto = makeSerializer<GetSbeDto, ISbe>(GetSbeDto);

export class PutSbeAdminApiRegister {
  modifiedById?: number | undefined;
  id: number;

  @IsString()
  @Expose()
  adminRegisterUrl?: string;
}
export class PutSbeAdminApi {
  modifiedById?: number | undefined;
  id: number;

  @IsString()
  @IsOptional()
  @Expose()
  adminUrl?: string;

  @IsString()
  @IsOptional()
  @Expose()
  adminKey?: string;

  @IsString()
  @IsOptional()
  @Expose()
  adminSecret?: string;
}
export class PutSbeMeta {
  modifiedById?: number | undefined;
  id: number;

  @IsString()
  @IsOptional()
  @IsArn()
  @Expose()
  arn?: string;

  @IsString()
  @IsOptional()
  @Expose()
  metaKey?: string;

  @IsString()
  @IsOptional()
  @Expose()
  metaSecret?: string;
}

export class PostSbeDto
  extends DtoPostBase
  implements
    PostDto<ISbe, 'ownerships' | 'envLabel' | 'odss' | 'edorgs' | 'configPrivate' | 'configPublic'>
{
  @Expose()
  @MinLength(3)
  name: string;
}
export class PutSbeDto
  extends DtoPutBase
  implements
    PutDto<ISbe, 'ownerships' | 'envLabel' | 'odss' | 'edorgs' | 'configPrivate' | 'configPublic'>
{
  @Expose()
  @MinLength(3)
  name: string;
}
