import { HStack } from '@chakra-ui/react';
import { DataTable } from '@edanalytics/common-ui';
import { GetOwnershipDto } from '@edanalytics/models';
import { CellContext } from '@tanstack/react-table';
import { ownershipQueries, roleQueries, tenantQueries } from '../../api';
import { ActionBarActions } from '../../helpers';
import { TableRowActions } from '../../helpers/TableRowActions';
import { getRelationDisplayName } from '../../helpers/getRelationDisplayName';
import { OwnershipGlobalLink, TenantLink } from '../../routes';
import { RoleGlobalLink } from '../../routes/role-global.routes';
import { PageTemplate } from '../../Layout/PageTemplate';
import { useMultipleOwnershipGlobalActions } from './useMultipleOwnershipGlobalActions';
import { useOwnershipGlobalActions } from './useOwnershipGlobalActions';

const OwnershipsNameCell = (info: CellContext<GetOwnershipDto, unknown>) => {
  const ownerships = ownershipQueries.useAll({});
  const actions = useOwnershipGlobalActions(info.row.original);
  return (
    <HStack justify="space-between">
      <OwnershipGlobalLink id={info.row.original.id} query={ownerships} />
      <TableRowActions actions={actions} />
    </HStack>
  );
};

export const OwnershipsGlobalPage = () => {
  const ownerships = ownershipQueries.useAll({});
  const roles = roleQueries.useAll({});
  const tenants = tenantQueries.useAll({});
  const actions = useMultipleOwnershipGlobalActions();
  return (
    <PageTemplate title="Resource ownerships" actions={<ActionBarActions actions={actions} />}>
      <DataTable
        data={Object.values(ownerships?.data || {})}
        columns={[
          {
            accessorKey: 'displayName',
            cell: OwnershipsNameCell,
            header: () => 'Name',
          },
          {
            id: 'tenant',
            accessorFn: (info) => getRelationDisplayName(info.tenantId, tenants),
            header: () => 'Tenant',
            cell: (info) => <TenantLink id={info.row.original.tenantId} query={tenants} />,
          },
          {
            id: 'role',
            accessorFn: (info) => getRelationDisplayName(info.roleId, roles),
            header: () => 'Role',
            cell: (info) => <RoleGlobalLink id={info.row.original.roleId} query={roles} />,
          },
          {
            id: 'resource',
            accessorFn: (info) =>
              info.edorg
                ? `Ed-Org - ${info.edorg.displayName}`
                : info.ods
                ? `Ods - ${info.ods.displayName}`
                : `Environment - ${info.sbe?.displayName}`,
            header: () => 'Resource',
            cell: ({ row: { original } }) =>
              original.edorg
                ? original.edorg.displayName
                : original.ods
                ? original.ods.displayName
                : original.sbe
                ? original.sbe.displayName
                : '-',
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
