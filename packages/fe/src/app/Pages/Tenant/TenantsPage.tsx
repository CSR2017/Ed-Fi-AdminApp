import { HStack } from '@chakra-ui/react';
import { DataTable } from '@edanalytics/common-ui';
import { tenantQueries, userQueries } from '../../api';
import { getRelationDisplayName } from '../../helpers/getRelationDisplayName';
import { TenantLink, UserLink } from '../../routes';
import { PageTemplate } from '../PageTemplate';

export const TenantsPage = () => {
  const tenants = tenantQueries.useAll({});
  const users = userQueries.useAll({});

  return (
    <PageTemplate title="Tenants">
      <DataTable
        data={Object.values(tenants?.data || {})}
        columns={[
          {
            accessorKey: 'displayName',
            cell: (info) => (
              <HStack justify="space-between">
                <TenantLink id={info.row.original.id} query={tenants} />
              </HStack>
            ),
            header: () => 'Name',
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
