import { HStack } from '@chakra-ui/react';
import { DataTable } from '@edanalytics/common-ui';
import { useParams } from '@tanstack/router';
import { claimsetQueries, userQueries } from '../../api';
import { ClaimsetLink, claimsetsRoute } from '../../routes';
import { PageTemplate } from '../PageTemplate';

export const ClaimsetsPage = () => {
  const params = useParams({ from: claimsetsRoute.id });
  const claimsets = claimsetQueries.useAll({
    tenantId: params.asId,
    sbeId: params.sbeId,
  });
  const deleteClaimset = claimsetQueries.useDelete({
    tenantId: params.asId,
    sbeId: params.sbeId,
  });
  const users = userQueries.useAll({ tenantId: params.asId });

  return (
    <PageTemplate title="Claimsets">
      <DataTable
        data={Object.values(claimsets?.data || {})}
        columns={[
          {
            accessorKey: 'displayName',
            cell: (info) => (
              <HStack justify="space-between">
                <ClaimsetLink
                  id={info.row.original.id}
                  query={claimsets}
                  sbeId={params.sbeId}
                />
                <HStack
                  className="row-hover"
                  color="gray.600"
                  align="middle"
                ></HStack>
              </HStack>
            ),
            header: () => 'Name',
          },
          {
            accessorKey: 'applicationsCount',
            header: () => 'Applications count',
          },
        ]}
      />
    </PageTemplate>
  );
};
