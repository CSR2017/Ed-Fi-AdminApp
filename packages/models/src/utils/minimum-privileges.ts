import { PrivilegeCode } from '..';

export const upwardInheritancePrivileges = new Set<PrivilegeCode>([
  'team.sb-environment:read',
  'team.sb-environment.edfi-tenant:read',
  'team.sb-environment.edfi-tenant.ods:read',
  'team.sb-environment.edfi-tenant.ods.edorg:read',
  'team.sb-environment.edfi-tenant.claimset:read',
  'team.sb-environment.edfi-tenant.vendor:read',
]);
export const minimumPrivileges = upwardInheritancePrivileges;
