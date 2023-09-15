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

    /** Union of:
     * - user's global-type rights, and
     * - intersection of tenant's rights and user's tenant-type rights
     *
     * So if a user has a global privilege (e.g. sbe.edorg:read), then
     * they can use it. If they have a tenant privilege (e.g.
     * tenant.sbe.edorg:read), they can only use it if the tenant
     * itself also has that privilege on the relevant resource.
     */
    const authorizationCache: AuthorizationCache = {};
    const tenantIdStr = request.params?.tenantId;

    const userPrivileges = await this.authService.getUserPrivileges(
      request.user.id,
      tenantIdStr === undefined ? undefined : Number(tenantIdStr)
    );
    userPrivileges.forEach((userPrivilege) => {
      if (isGlobalPrivilege(userPrivilege)) {
        authorizationCache[userPrivilege] = true;
      }
    });

    if (typeof tenantIdStr === 'string') {
      const tenantId = Number(tenantIdStr);
      const tenantCache = await this.authService.getTenantOwnershipCache(tenantId);
      Object.keys(tenantCache).forEach((k: keyof ITenantCache) => {
        if (userPrivileges.has(k)) {
          authorizationCache[k] = tenantCache[k] as any;
        }
      });
    }
    request['authorizationCache'] = authorizationCache;

    return true;
  }
}
