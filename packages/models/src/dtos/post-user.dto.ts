import { Expose } from 'class-transformer';
import { GlobalRole } from '../enums/global-role.enum';
import { IUser, IUserConfig } from '../interfaces/user.interface';
import { PostDto, DtoPostBase } from '../utils/dto-post-base';
export class PostUserDto
  extends DtoPostBase
  implements PostDto<IUser, 'fullName'>
{
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
  config?: IUserConfig;
}
