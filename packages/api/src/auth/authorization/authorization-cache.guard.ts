import { defineAbility, subject } from '@casl/ability';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { AUTHORIZE_KEY, AuthorizeMetadata } from './authorize.decorator';
import { IS_PUBLIC_KEY } from './public.decorator';
import {
  ITenantCache,
  isSbePrivilege,
  Ids,
  AuthorizationCache,
  isGlobalPrivilege,
} from '@edanalytics/models';

@Injectable()
export class AuthCacheGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(AuthService) private readonly authService: AuthService
  ) {}
  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const authorizationCache: AuthorizationCache = {};
    const tenantIdStr = request.params?.tenantId;

    const userPrivileges = await this.authService.getUserPrivileges(
      request.user.id,
      tenantIdStr === undefined ? undefined : Number(tenantIdStr)
    );
    const userGlobalPrivileges = [...userPrivileges].flatMap((userPrivilege) =>
      isGlobalPrivilege(userPrivilege) ? [userPrivilege] : []
    );

    userGlobalPrivileges.forEach((p) => {
      authorizationCache[p] = true;
    });

    let tenantCache: ITenantCache = {};
    if (typeof tenantIdStr === 'string') {
      const tenantId = Number(tenantIdStr);
      tenantCache = await this.authService.buildTenantOwnershipCache(tenantId);
      Object.keys(tenantCache).forEach((k: keyof ITenantCache) => {
        if (userPrivileges.has(k)) {
          authorizationCache[k] = tenantCache[k] as any;
        } else {
          delete tenantCache[k];
        }
      });
    }
    request['tenantCache'] = tenantCache;
    request['authorizationCache'] = authorizationCache;
    request['userPrivileges'] = userPrivileges;

    return true;
  }
}
