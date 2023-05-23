import { PrivilegeCode } from '@edanalytics/models';
import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import {
  Ids,
  isSbePrivilege,
  ITenantCache,
  SpecificIds,
} from '../authorization/tenant-cache.interface';

export const InjectFilter = createParamDecorator(
  (privilege: PrivilegeCode, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const cache: ITenantCache = request.tenantCache;

    let ids: Ids | undefined = undefined;

    if (isSbePrivilege(privilege)) {
      const sbeId = Number(request?.params?.sbeId);
      ids = cache?.[privilege]?.[sbeId] ?? undefined;
    } else {
      ids = cache?.[privilege] ?? undefined;
    }

    if (ids === undefined) return new Set() as SpecificIds;
    return ids;
  }
);
