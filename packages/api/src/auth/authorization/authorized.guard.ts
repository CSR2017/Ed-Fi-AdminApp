import { defineAbility, subject } from '@casl/ability';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
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
  PrivilegeCode,
} from '@edanalytics/models';

@Injectable()
export class AuthorizedGuard implements CanActivate {
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
    if (request.isAuthenticated()) {
      const userPrivileges: Set<PrivilegeCode> = request['userPrivileges'];
      const tenantCache: ITenantCache = request['tenantCache'];

      const tenantIdStr = request.params?.tenantId;
      const userGlobalPrivileges = [...userPrivileges].flatMap(
        (userPrivilege) =>
          isGlobalPrivilege(userPrivilege) ? [userPrivilege] : []
      );

      const ability = defineAbility((userCan) => {
        userGlobalPrivileges.forEach((userPrivilege) => {
          userCan(userPrivilege, userPrivilege, subject(userPrivilege, {}));
        });

        Object.keys(tenantCache ?? {}).forEach(
          (privilegeCode: keyof ITenantCache) => {
            const privilegeCache = tenantCache[privilegeCode];
            const sbeIds = Object.keys(privilegeCache);

            if (isSbePrivilege(privilegeCode)) {
              sbeIds.forEach((sbeIdStr) => {
                const sbeId = Number(sbeIdStr);
                const sbePrivilegeCache: Ids = privilegeCache[sbeId];
                const subjectIdCondition =
                  sbePrivilegeCache === true
                    ? {}
                    : {
                        id: {
                          $in: [
                            '__filtered__',
                            ...[...sbePrivilegeCache].map((v) => String(v)),
                          ],
                        },
                      };
                userCan(
                  privilegeCode,
                  privilegeCode,
                  subject(privilegeCode, {
                    tenantId: tenantIdStr,
                    sbeId: String(sbeId),
                    ...subjectIdCondition,
                  })
                );
              });
            } else {
              const basePrivilegeCache: Ids = tenantCache[privilegeCode];
              const ids =
                basePrivilegeCache === true
                  ? {}
                  : {
                      id: {
                        $in: [
                          '__filtered__',
                          ...[...basePrivilegeCache].map((v) => String(v)),
                        ],
                      },
                    };
              const subjectObject = subject(privilegeCode, {
                tenantId: tenantIdStr,
                ...ids,
              });
              userCan(privilegeCode, privilegeCode, subjectObject);
            }
          }
        );
      });

      request['abilities'] = ability;

      const authorizeRule = this.reflector.getAllAndOverride<
        AuthorizeMetadata | undefined
      >(AUTHORIZE_KEY, [context.getHandler(), context.getClass()]);

      if (authorizeRule === undefined) {
        // return false;
      } else {
        const privilege = authorizeRule.privilege;
        const subjectTemplate = authorizeRule.subject;
        const subjectObject: AuthorizeMetadata['subject'] = {
          ...('tenantId' in subjectTemplate
            ? { tenantId: request.params[subjectTemplate.tenantId] }
            : {}),
          ...('sbeId' in subjectTemplate
            ? { sbeId: request.params[subjectTemplate.sbeId] }
            : {}),
          id:
            subjectTemplate.id === '__filtered__'
              ? subjectTemplate.id
              : request.params[subjectTemplate.id],
        };
        subject(privilege, subjectObject);
        const authorizationResult = ability.can(privilege, subjectObject);
        if (!authorizationResult) {
          throw new HttpException('Unauthorized', 403);
        }
      }
      return true;
    } else {
      return false;
    }
  }
}
