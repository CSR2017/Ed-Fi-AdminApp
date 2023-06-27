import { PrivilegeCode } from '..';

export const upwardInheritancePrivileges = new Set<PrivilegeCode>([
  'tenant.sbe:read',
  'tenant.sbe.ods:read',
  'tenant.sbe.edorg:read',
  'tenant.sbe.claimset:read',
  'tenant.sbe.vendor:read',
]);
export const minimumPrivileges = upwardInheritancePrivileges;
