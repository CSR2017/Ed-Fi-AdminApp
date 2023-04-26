import { Expose } from 'class-transformer';
import { MinLength } from 'class-validator';
import { GlobalRole } from '../enums/global-role.enum';
import { IUser, IUserConfig } from '../interfaces/user.interface';
import { PutDto, DtoPutBase } from '../utils/dto-put-base';

export class PutUserDto
  extends DtoPutBase
  implements PutDto<IUser, 'fullName'>
{
  @Expose()
  username: string;

  @Expose()
  role: GlobalRole;

  @Expose()
  isActive: boolean;

  @Expose()
  @MinLength(2)
  givenName: string;

  @Expose()
  @MinLength(2)
  familyName: string;

  @Expose()
  config?: IUserConfig;
}
