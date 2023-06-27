import { Box, HStack } from '@chakra-ui/react';
import { DataTable } from '@edanalytics/common-ui';
import { GetUserTenantMembershipDto } from '@edanalytics/models';
import { CellContext } from '@tanstack/react-table';
import { useParams } from '@tanstack/router';
import {
  roleQueries,
  userQueries,
  userTenantMembershipQueries,
} from '../../api';
import { getRelationDisplayName } from '../../helpers/getRelationDisplayName';
import { useReadTenantEntity } from '../../helpers/useStandardRowActionsNew';
import { RoleLink, UserLink, userRoute, usersRoute } from '../../routes';
import { PageTemplate } from '../PageTemplate';
import { ActionsType } from '../../helpers/ActionsType';
import { TableRowActions } from '../../helpers/TableRowActions';
import _ from 'lodash';

const NameCell = (info: CellContext<GetUserTenantMembershipDto, unknown>) => {
  const params = useParams({ from: usersRoute.id });
  const users = userQueries.useAll({
    tenantId: params.asId,
  });
  const deleteUser = userQueries.useDelete({
    tenantId: params.asId,
  });

  const View = useReadTenantEntity({
    entity: info.row.original,
    params: { userId: String(info.row.original.userId), ...params },
    privilege: 'tenant.user:read',
    route: userRoute,
  });
  const actions = {
    ...(View ? { View } : undefined),
  };
  return (
    <HStack justify="space-between">
      <UserLink id={info.row.original.userId} query={users} />
      <TableRowActions actions={actions} />
    </HStack>
  );
};
export const UsersPage = () => {
  const params = useParams({ from: usersRoute.id });
  const users = userQueries.useAll({
    tenantId: params.asId,
  });

  const roles = roleQueries.useAll({
    tenantId: params.asId,
  });

  const userTenantMemberships = userTenantMembershipQueries.useAll({
    tenantId: params.asId,
  });

  return (
    <PageTemplate title="Users">
      <DataTable
        data={Object.values(userTenantMemberships?.data || {})}
        columns={[
          {
            id: 'displayName',
            accessorFn: (info) => getRelationDisplayName(info.userId, users),
            cell: NameCell,
            header: () => 'Name',
          },
          {
            id: 'role',
            accessorFn: (info) => getRelationDisplayName(info.roleId, roles),
            cell: (info) => (
              <RoleLink id={info.row.original.roleId} query={roles} />
            ),
            header: () => 'Tenant role',
          },
          {
            accessorKey: 'createdDetailed',
            header: () => 'Created',
          },
        ]}
      />
    </PageTemplate>
  );
};
