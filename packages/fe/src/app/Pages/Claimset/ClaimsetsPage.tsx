import { HStack } from '@chakra-ui/react';
import { DataTable } from '@edanalytics/common-ui';
import { useParams } from 'react-router-dom';
import { claimsetQueries } from '../../api';
import { ClaimsetLink } from '../../routes';
import { PageTemplate } from '../PageTemplate';

export const ClaimsetsPage = () => {
  const params = useParams() as { asId: string; sbeId: string };
  const claimsets = claimsetQueries.useAll({
    tenantId: params.asId,
    sbeId: params.sbeId,
  });

  return (
    <PageTemplate title="Claimsets">
      <DataTable
        data={Object.values(claimsets?.data || {})}
        columns={[
          {
            accessorKey: 'displayName',
            cell: (info) => (
              <HStack justify="space-between">
                <ClaimsetLink id={info.row.original.id} query={claimsets} />
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
