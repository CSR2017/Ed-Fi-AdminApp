import { DataTable } from '@edanalytics/common-ui';
import { useParams } from 'react-router-dom';
import { odsQueries, userQueries } from '../../api/queries/queries';
import { getRelationDisplayName } from '../../helpers/getRelationDisplayName';
import { UserLink } from '../../routes';
import { PageTemplate } from '../../Layout/PageTemplate';
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
  const users = userQueries.useAll({ tenantId: params.asId });

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
