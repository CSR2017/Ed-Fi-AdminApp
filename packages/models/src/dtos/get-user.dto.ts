import { Expose, Type } from 'class-transformer';
import { GlobalRole } from '../enums/global-role.enum';
import { IUser, IUserConfig } from '../interfaces/user.interface';
import { DtoGetBase__User, GetDto } from '../utils/dto-get-base';
import { makeSerializer } from '../utils/make-serializer';

export class GetUserDto extends DtoGetBase__User implements GetDto<IUser> {
  @Expose()
  username: string;
  @Expose()
  role: GlobalRole;
  @Expose()
  isActive: boolean;
  @Expose()
  givenName: string;
  @Expose()
  familyName: string;
  @Expose()
  get fullName() {
    return this.givenName + ' ' + this.familyName;
  }
  config?: IUserConfig;

  override get displayName() {
    return this.fullName;
  }
}
export const toGetUserDto = makeSerializer(GetUserDto);
