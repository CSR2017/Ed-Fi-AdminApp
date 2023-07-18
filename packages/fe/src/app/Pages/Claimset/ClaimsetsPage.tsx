import { DataTable } from '@edanalytics/common-ui';
import { useParams } from 'react-router-dom';
import { claimsetQueries } from '../../api';
import { PageTemplate } from '../PageTemplate';
import { NameCell } from './NameCell';

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
            cell: NameCell(params),
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
