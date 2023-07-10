import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserPrivileges = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.userPrivileges;
});
