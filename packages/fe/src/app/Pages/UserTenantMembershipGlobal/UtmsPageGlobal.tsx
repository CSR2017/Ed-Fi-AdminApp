import { HStack } from '@chakra-ui/react';
import { DataTable } from '@edanalytics/common-ui';
import { GetUserTenantMembershipDto } from '@edanalytics/models';
import { CellContext } from '@tanstack/react-table';
import _ from 'lodash';
import { PageTemplate } from '../../Layout/PageTemplate';
import { roleQueries, tenantQueries, userQueries, userTenantMembershipQueries } from '../../api';
import { ActionBarActions, TableRowActions } from '../../helpers';
import { getRelationDisplayName } from '../../helpers/getRelationDisplayName';
import { TenantLink, UserGlobalLink, UserLink, UtmGlobalLink } from '../../routes';
import { useUtmActionsGlobal } from './useUtmActionsGlobal';
import { useUtmsActionsGlobal } from './useUtmsActionsGlobal';
import { RoleGlobalLink } from '../../routes/role-global.routes';

const UtmGlobalNameCell = (info: CellContext<GetUserTenantMembershipDto, unknown>) => {
  const userTenantMemberships = userTenantMembershipQueries.useAll({});
  const actions = useUtmActionsGlobal(info.row.original);
  return (
    <HStack justify="space-between">
      <UtmGlobalLink id={info.row.original.id} query={userTenantMemberships} />
      <TableRowActions actions={actions} />
    </HStack>
  );
};

export const UtmsGlobalPage = () => {
  const userTenantMemberships = userTenantMembershipQueries.useAll({});
  const users = userQueries.useAll({});
  const tenants = tenantQueries.useAll({});
  const roles = roleQueries.useAll({});
  const actions = useUtmsActionsGlobal();

  return (
    <PageTemplate
      title="Tenant memberships"
      actions={<ActionBarActions actions={_.omit(actions, 'View')} />}
    >
      <DataTable
        data={Object.values(userTenantMemberships?.data || {})}
        columns={[
          {
            accessorKey: 'displayName',
            cell: UtmGlobalNameCell,
            header: () => '',
          },
          {
            id: 'tenant',
            accessorFn: (info) => getRelationDisplayName(info.tenantId, tenants),
            header: () => 'Tenant',
            cell: (info) => <TenantLink id={info.row.original.tenantId} query={tenants} />,
          },
          {
            id: 'user',
            accessorFn: (info) => getRelationDisplayName(info.userId, users),
            header: () => 'User',
            cell: (info) => <UserGlobalLink id={info.row.original.userId} />,
          },
          {
            id: 'role',
            accessorFn: (info) => getRelationDisplayName(info.roleId, roles),
            header: () => 'Role',
            cell: (info) => <RoleGlobalLink id={info.row.original.roleId} query={roles} />,
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
