import { Box } from '@chakra-ui/react';
import {
  PageActions,
  SbaaTableAllInOne,
  PageTemplate,
  SbaaTable,
  SbaaTableAdvancedButton,
  SbaaTableFilters,
  SbaaTablePagination,
  SbaaTableProvider,
  SbaaTableSearch,
  ValueAsDate,
} from '@edanalytics/common-ui';
import { ownershipQueries, roleQueries, tenantQueries } from '../../api';
import { getRelationDisplayName } from '../../helpers/getRelationDisplayName';
import { TenantLink } from '../../routes';
import { RoleGlobalLink } from '../../routes/role-global.routes';
import { useMultipleOwnershipGlobalActions } from './useMultipleOwnershipGlobalActions';
import { OwnershipsNameCell } from './OwnershipsNameCell';

export const OwnershipsGlobalPage = () => {
  const ownerships = ownershipQueries.useAll({});
  const roles = roleQueries.useAll({});
  const tenants = tenantQueries.useAll({});
  const actions = useMultipleOwnershipGlobalActions();
  return (
    <PageTemplate title="Resource ownerships" actions={<PageActions actions={actions} />}>
      <SbaaTableAllInOne
        data={Object.values(ownerships?.data || {})}
        columns={[
          {
            accessorKey: 'displayName',
            cell: OwnershipsNameCell,
            header: 'Name',
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
            id: 'resource',
            accessorFn: (info) =>
              info.edorg
                ? `Ed-Org - ${info.edorg.displayName}`
                : info.ods
                ? `Ods - ${info.ods.displayName}`
                : `Environment - ${info.sbe?.displayName}`,
            header: 'Resource',
            cell: ({ row: { original } }) =>
              original.edorg
                ? original.edorg.displayName
                : original.ods
                ? original.ods.displayName
                : original.sbe
                ? original.sbe.displayName
                : '-',
            filterFn: 'equalsString',
            meta: {
              type: 'options',
            },
          },
          {
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
