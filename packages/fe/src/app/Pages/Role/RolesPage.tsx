import { Button, HStack } from '@chakra-ui/react';
import { DataTable } from '@edanalytics/common-ui';
import { GetRoleDto, RoleType } from '@edanalytics/models';
import { CellContext } from '@tanstack/react-table';
import { useParams } from '@tanstack/router';
import { BiPlus } from 'react-icons/bi';
import { roleQueries, useMyTenants, userQueries } from '../../api';
import {
  AuthorizeComponent,
  getEntityFromQuery,
  tenantRoleAuthConfig,
} from '../../helpers';
import { getRelationDisplayName } from '../../helpers/getRelationDisplayName';
import { useStandardRowActions } from '../../helpers/getStandardActions';
import { RoleLink, roleRoute, rolesRoute, UserLink } from '../../routes';
import { PageTemplate } from '../PageTemplate';

const RoleNameCell = (info: CellContext<GetRoleDto, unknown>) => {
  const params = useParams({ from: rolesRoute.id });
  const roles = roleQueries.useAll({
    tenantId: params.asId,
  });
  const deleteRole = roleQueries.useDelete({
    tenantId: params.asId,
  });
  const [View, Edit, Delete] = useStandardRowActions({
    info: info,
    mutation: deleteRole.mutate,
    route: roleRoute,
    params: (params: any) => ({
      ...params,
      roleId: String(info.row.original.id),
    }),
  });
  const role = getEntityFromQuery(info.row.original.id, roles);
  return (
    <HStack justify="space-between">
      <RoleLink id={info.row.original.id} query={roles} />
      <HStack className="row-hover" color="gray.600" align="middle">
        <View />
        <AuthorizeComponent
          config={tenantRoleAuthConfig(
            role?.id,
            role?.tenantId,
            'tenant.role:delete'
          )}
        >
          <Delete />
        </AuthorizeComponent>
      </HStack>
    </HStack>
  );
};

export const RolesPage = () => {
  const params = useParams({ from: rolesRoute.id });
  const tenantId = Number(params.asId);
  const roles = roleQueries.useAll({
    tenantId: params.asId,
  });
  const deleteRole = roleQueries.useDelete({
    tenantId: params.asId,
  });
  const users = userQueries.useAll({ tenantId: params.asId });
  const tenants = useMyTenants();

  return (
    <PageTemplate title="Roles" justifyActionsLeft>
      <DataTable
        data={Object.values(roles?.data || {})}
        columns={[
          {
            accessorKey: 'displayName',
            cell: RoleNameCell,
            header: () => 'Name',
          },
          {
            id: 'type',
            accessorFn: (info) => RoleType[info.type],
            header: () => 'Type',
          },
          {
            id: 'owned-by',
            accessorFn: (info) =>
              typeof info.tenantId === 'number'
                ? getRelationDisplayName(info.tenantId, tenants)
                : 'Public',
            header: () => 'Owned by',
          },
          {
            id: 'modifiedBy',
            accessorFn: (info) =>
              getRelationDisplayName(info.modifiedById, users),
            header: () => 'Modified by',
            cell: (info) => (
              <UserLink query={users} id={info.row.original.modifiedById} />
            ),
          },
          {
            accessorKey: 'createdDetailed',
            header: () => 'Created',
          },
          {
            id: 'createdBy',
            accessorFn: (info) =>
              getRelationDisplayName(info.createdById, users),
            header: () => 'Created by',
            cell: (info) => (
              <UserLink query={users} id={info.row.original.createdById} />
            ),
          },
        ]}
      />
    </PageTemplate>
  );
};
