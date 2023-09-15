import { GetPrivilegeDto } from '@edanalytics/models';
import set from 'lodash/set';

export type PrivilegeNest = Partial<{ [code: string]: PrivilegeNest }>;
export const nestPrivileges = (privileges: GetPrivilegeDto[]) =>
  privileges.reduce<PrivilegeNest>((acc, { code }) => {
    const [path] = code.split(':');
    const pathArr = path.split('.');
    set(acc, [...pathArr, code], {});
    return acc;
  }, {});
