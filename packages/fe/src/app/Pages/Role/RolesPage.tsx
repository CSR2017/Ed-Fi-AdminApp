import { Box, HStack } from '@chakra-ui/react';
import { DataTable } from '@edanalytics/common-ui';
import { GetRoleDto, RoleType } from '@edanalytics/models';
import { CellContext } from '@tanstack/react-table';
import { useParams } from 'react-router-dom';
import { roleQueries, useMyTenants, userQueries } from '../../api';
import { getEntityFromQuery } from '../../helpers';
import { getRelationDisplayName } from '../../helpers/getRelationDisplayName';
import { RoleLink, UserLink, rolesRoute } from '../../routes';
import { PageTemplate } from '../../Layout/PageTemplate';
import { TableRowActions } from '../../helpers/TableRowActions';
import { useRoleActions } from './useRoleActions';

const NameCell = (info: CellContext<GetRoleDto, unknown>) => {
  const params = useParams() as { asId: string };
  const entities = roleQueries.useAll({
    tenantId: params.asId,
  });
  const actions = useRoleActions(info.row.original);
  return (
    <HStack justify="space-between">
      <RoleLink id={info.row.original.id} query={entities} />
      <TableRowActions actions={actions} />
    </HStack>
  );
};

export const RolesPage = () => {
  const params = useParams();
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
            cell: NameCell,
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
            accessorFn: (info) => getRelationDisplayName(info.modifiedById, users),
            header: () => 'Modified by',
            cell: (info) => <UserLink query={users} id={info.row.original.modifiedById} />,
          },
          {
            accessorKey: 'createdDetailed',
            header: () => 'Created',
          },
          {
            id: 'createdBy',
            accessorFn: (info) => getRelationDisplayName(info.createdById, users),
            header: () => 'Created by',
            cell: (info) => <UserLink query={users} id={info.row.original.createdById} />,
          },
        ]}
      />
    </PageTemplate>
  );
};
