import { HStack } from '@chakra-ui/react';
import { DataTable } from '@edanalytics/common-ui';
import { GetTenantDto } from '@edanalytics/models';
import { CellContext } from '@tanstack/react-table';
import _ from 'lodash';
import { PageTemplate } from '../../Layout/PageTemplate';
import { tenantQueries, userQueries } from '../../api';
import { ActionBarActions, TableRowActions } from '../../helpers';
import { getRelationDisplayName } from '../../helpers/getRelationDisplayName';
import { TenantLink, UserGlobalLink } from '../../routes';
import { useTenantActions } from './useTenantActions';
import { useTenantsActions } from './useTenantsActions';

const TenantNameCell = (info: CellContext<GetTenantDto, unknown>) => {
  const tenants = tenantQueries.useAll({});
  const actions = useTenantActions(info.row.original);
  return (
    <HStack justify="space-between">
      <TenantLink id={info.row.original.id} query={tenants} />
      <TableRowActions actions={actions} />
    </HStack>
  );
};

export const TenantsPage = () => {
  const tenants = tenantQueries.useAll({});
  const users = userQueries.useAll({ optional: true });
  const actions = useTenantsActions();

  return (
    <PageTemplate title="Tenants" actions={<ActionBarActions actions={_.omit(actions, 'View')} />}>
      <DataTable
        data={Object.values(tenants?.data || {})}
        columns={[
          {
            accessorKey: 'displayName',
            cell: TenantNameCell,
            header: () => 'Name',
          },
          {
            id: 'modifiedBy',
            accessorFn: (info) => getRelationDisplayName(info.modifiedById, users),
            header: () => 'Modified by',
            cell: (info) => <UserGlobalLink id={info.row.original.modifiedById} />,
          },
          {
            accessorKey: 'createdDetailed',
            header: () => 'Created',
          },
          {
            id: 'createdBy',
            accessorFn: (info) => getRelationDisplayName(info.createdById, users),
            header: () => 'Created by',
            cell: (info) => <UserGlobalLink id={info.row.original.createdById} />,
          },
        ]}
      />
    </PageTemplate>
  );
};
