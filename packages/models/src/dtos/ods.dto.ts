import { Expose } from 'class-transformer';
import { IEdorg } from '../interfaces';
import { IOds } from '../interfaces/ods.interface';
import { DtoGetBase, GetDto } from '../utils/get-base.dto';
import { makeSerializer } from '../utils/make-serializer';
import { DtoPostBase, PostDto } from '../utils/post-base.dto';
import { DtoPutBase, PutDto } from '../utils/put-base.dto';

export class GetOdsDto extends DtoGetBase implements GetDto<IOds, 'ownerships' | 'sbe' | 'edorgs'> {
  @Expose()
  sbeId: number;

  @Expose()
  dbName: string;

  override get displayName() {
    return this.dbName;
  }
}
export const toGetOdsDto = makeSerializer(GetOdsDto);

export class PutOdsDto extends DtoPutBase implements PutDto<IOds, 'ownerships' | 'sbe' | 'edorgs'> {
  @Expose()
  sbeId: number;
  @Expose()
  dbName: string;
  @Expose()
  edorgs?: IEdorg[] | undefined;
}

export class PostOdsDto
  extends DtoPostBase
  implements PostDto<IOds, 'ownerships' | 'sbe' | 'edorgs'>
{
  @Expose()
  sbeId: number;
  @Expose()
  dbName: string;
  @Expose()
  edorgs?: IEdorg[] | undefined;
}
