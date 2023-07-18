import { Expose } from 'class-transformer';
import { EdorgType } from '../enums';
import { IEdorg } from '../interfaces/edorg.interface';
import { DtoGetBase, GetDto } from '../utils/get-base.dto';
import { makeSerializer } from '../utils/make-serializer';

export class GetEdorgDto
  extends DtoGetBase
  implements GetDto<IEdorg, 'ownerships' | 'ods' | 'parent' | 'children' | 'sbe'>
{
  @Expose()
  sbeId: number;
  @Expose()
  odsId: number;
  @Expose()
  odsDbName: string;

  @Expose()
  parentId?: number;

  @Expose()
  educationOrganizationId: number;
  @Expose()
  nameOfInstitution: string;
  @Expose()
  shortNameOfInstitution: string;
  @Expose()
  discriminator: EdorgType;

  override get displayName() {
    return this.nameOfInstitution;
  }
}
export const toGetEdorgDto = makeSerializer(GetEdorgDto);
