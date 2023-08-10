import { DataTable } from '@edanalytics/common-ui';
import { claimsetQueries } from '../../api';
import { useNavContext } from '../../helpers';
import { PageTemplate } from '../../Layout/PageTemplate';
import { NameCell } from './NameCell';

export const ClaimsetsPage = () => {
  return (
    <PageTemplate title="Claimsets">
      <ClaimsetsPageContent />
    </PageTemplate>
  );
};

export const ClaimsetsPageContent = () => {
  const navContext = useNavContext();
  const sbeId = navContext.sbeId!;
  const asId = navContext.asId!;

  const claimsets = claimsetQueries.useAll({
    tenantId: asId,
    sbeId: sbeId,
  });

  return (
    <DataTable
      data={Object.values(claimsets?.data || {})}
      columns={[
        {
          accessorKey: 'displayName',
          cell: NameCell,
          header: () => 'Name',
        },
        {
          accessorKey: 'applicationsCount',
          header: () => 'Applications count',
        },
      ]}
    />
  );
};
