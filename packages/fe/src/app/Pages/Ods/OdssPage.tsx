import { DataTable } from '@edanalytics/common-ui';
import { useParams } from 'react-router-dom';
import { PageTemplate } from '../../Layout/PageTemplate';
import { odsQueries } from '../../api/queries/queries';
import { NameCell } from './NameCell';

export const OdssPage = () => {
  const params = useParams() as {
    asId: string;
    sbeId: string;
  };
  const odss = odsQueries.useAll({
    sbeId: params.sbeId,
    tenantId: params.asId,
  });

  return (
    <PageTemplate title="Operational Data Stores">
      <DataTable
        data={Object.values(odss?.data || {})}
        columns={[
          {
            accessorKey: 'displayName',
            cell: NameCell,
            header: () => 'Name',
          },
          {
            accessorKey: 'createdDetailed',
            header: () => 'Created',
          },
          {
            accessorKey: 'modifiedDetailed',
            header: () => 'Modified',
          },
        ]}
      />
    </PageTemplate>
  );
};
