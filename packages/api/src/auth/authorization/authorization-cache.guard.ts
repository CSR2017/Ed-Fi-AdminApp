import { AuthorizationCache, ITenantCache, isGlobalPrivilege } from '@edanalytics/models';
import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { IS_PUBLIC_KEY } from './public.decorator';

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

    let userTenantCache: ITenantCache = {};
    if (typeof tenantIdStr === 'string') {
      const tenantId = Number(tenantIdStr);
      userTenantCache = await this.authService.getTenantOwnershipCache(tenantId);
      Object.keys(userTenantCache).forEach((k: keyof ITenantCache) => {
        if (userPrivileges.has(k)) {
          authorizationCache[k] = userTenantCache[k] as any;
        } else {
          delete userTenantCache[k];
        }
      });
    }
    request['userTenantCache'] = userTenantCache;
    request['authorizationCache'] = authorizationCache;
    request['userPrivileges'] = userPrivileges;

    return true;
  }
}
