import { Button, HStack } from '@chakra-ui/react';
import { DataTable } from '@edanalytics/common-ui';
import { GetOwnershipDto } from '@edanalytics/models';
import { CellContext } from '@tanstack/react-table';
import { BiPlus } from 'react-icons/bi';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { ownershipQueries, roleQueries, tenantQueries } from '../../api';
import { AuthorizeComponent, globalOwnershipAuthConfig } from '../../helpers';
import { TableRowActions } from '../../helpers/TableRowActions';
import { getRelationDisplayName } from '../../helpers/getRelationDisplayName';
import { OwnershipGlobalLink, ownershipGlobalCreateRoute } from '../../routes';
import { PageTemplate } from '../PageTemplate';
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
  const params = useParams();
  const ownerships = ownershipQueries.useAll({});
  const roles = roleQueries.useAll({});
  const tenants = tenantQueries.useAll({});

  return (
    <PageTemplate
      title="Resource ownerships"
      actions={
        <AuthorizeComponent
          config={globalOwnershipAuthConfig('ownership:create')}
        >
          <RouterLink
            style={{ display: 'flex' }}
            title="Grant new tenant resource ownership"
            to={`/ownerships/create`}
          >
            <Button as="div" leftIcon={<BiPlus />}>
              Grant new
            </Button>
          </RouterLink>
        </AuthorizeComponent>
      }
    >
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
            accessorFn: (info) =>
              getRelationDisplayName(info.tenantId, tenants),
            header: () => 'Tenant',
            cell: (info) =>
              getRelationDisplayName(info.row.original.tenantId, tenants),
          },
          {
            id: 'role',
            accessorFn: (info) => getRelationDisplayName(info.roleId, roles),
            header: () => 'Role',
            cell: (info) =>
              getRelationDisplayName(info.row.original.roleId, roles),
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
