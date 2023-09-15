import { Box } from '@chakra-ui/react';
import {
  PageActions,
  PageTemplate,
  SbaaTable,
  SbaaTableAdvancedButton,
  SbaaTableAllInOne,
  SbaaTableFilters,
  SbaaTablePagination,
  SbaaTableProvider,
  SbaaTableSearch,
  ValueAsDate,
} from '@edanalytics/common-ui';
import omit from 'lodash/omit';
import { roleQueries, tenantQueries, userQueries, userTenantMembershipQueries } from '../../api';
import { getRelationDisplayName } from '../../helpers/getRelationDisplayName';
import { TenantLink, UserGlobalLink } from '../../routes';
import { RoleGlobalLink } from '../../routes/role-global.routes';
import { useUtmsActionsGlobal } from './useUtmsActionsGlobal';
import { UtmGlobalNameCell } from './UtmGlobalNameCell';

export const UtmsGlobalPage = () => {
  const userTenantMemberships = userTenantMembershipQueries.useAll({});
  const users = userQueries.useAll({});
  const tenants = tenantQueries.useAll({});
  const roles = roleQueries.useAll({});
  const actions = useUtmsActionsGlobal();

  return (
    <PageTemplate
      title="Tenant memberships"
      actions={<PageActions actions={omit(actions, 'View')} />}
    >
      <SbaaTableAllInOne
        data={Object.values(userTenantMemberships?.data || {})}
        columns={[
          {
            accessorKey: 'displayName',
            cell: UtmGlobalNameCell,
            header: '',
            enableSorting: false,
          },
          {
            id: 'tenant',
            accessorFn: (info) => getRelationDisplayName(info.tenantId, tenants),
            header: 'Tenant',
            cell: (info) => <TenantLink id={info.row.original.tenantId} query={tenants} />,
            filterFn: 'equalsString',
            meta: {
              type: 'options',
            },
          },
          {
            id: 'user',
            accessorFn: (info) => getRelationDisplayName(info.userId, users),
            header: 'User',
            cell: (info) => <UserGlobalLink id={info.row.original.userId} />,
            filterFn: 'equalsString',
            meta: {
              type: 'options',
            },
          },
          {
            id: 'role',
            accessorFn: (info) => getRelationDisplayName(info.roleId, roles),
            header: 'Role',
            cell: (info) => <RoleGlobalLink id={info.row.original.roleId} query={roles} />,
            filterFn: 'equalsString',
            meta: {
              type: 'options',
            },
          },
          {
            id: 'createdDetailed',
            accessorKey: 'createdNumber',
            cell: ValueAsDate(),
            header: 'Created',
            meta: {
              type: 'date',
            },
          },
        ]}
      />
    </PageTemplate>
  );
};
