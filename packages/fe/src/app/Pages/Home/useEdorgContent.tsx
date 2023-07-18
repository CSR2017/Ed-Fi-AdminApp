import { Stat, StatLabel, StatNumber, Tab, TabPanel } from '@chakra-ui/react';
import { DataTable } from '@edanalytics/common-ui';
import { GetEdorgDto, GetSbeDto } from '@edanalytics/models';
import { CellContext } from '@tanstack/react-table';
import { useParams } from 'react-router-dom';
import { edorgQueries, odsQueries } from '../../api';
import { AuthorizeConfig, arrayElemIf, getRelationDisplayName, useAuthorize } from '../../helpers';
import { EdorgLink, OdsLink } from '../../routes';
import { NameCell } from '../Edorg/NameCell';

export const useEdorgContent = (props: { sbe: GetSbeDto }) => {
  const params = useParams() as { asId: string };
  const edorgs = edorgQueries.useAll({
    optional: true,
    tenantId: params.asId,
    sbeId: props.sbe.id,
  });
  const authConfig: AuthorizeConfig = {
    privilege: 'tenant.sbe.edorg:read',
    subject: {
      id: '__filtered__',
      sbeId: props.sbe.id,
      tenantId: Number(params.asId),
    },
  };
  const odsAuth: AuthorizeConfig = {
    privilege: 'tenant.sbe.ods:read',
    subject: {
      id: '__filtered__',
      sbeId: props.sbe.id,
      tenantId: Number(params.asId),
    },
  };
  const odss = odsQueries.useAll({ optional: true, tenantId: params.asId, sbeId: props.sbe.id });
  const canShowOds = useAuthorize(odsAuth);
  const canShow = useAuthorize(authConfig);
  return canShow
    ? {
        Stat: (
          <Stat flex="0 0 auto">
            <StatLabel>Ed-Orgs</StatLabel>
            <StatNumber>{Object.keys(edorgs.data ?? {}).length}</StatNumber>
          </Stat>
        ),
        Tab: <Tab>Ed-Orgs</Tab>,
        TabContent: (
          <TabPanel>
            <DataTable
              pageSizes={[5, 10, 15]}
              data={Object.values(edorgs?.data || {})}
              columns={[
                {
                  accessorKey: 'displayName',
                  cell: NameCell({ asId: params.asId, sbeId: String(props.sbe.id) }),
                  header: () => 'Name',
                },
                {
                  id: 'parent',
                  accessorFn: (info) => getRelationDisplayName(info.parentId, edorgs),
                  header: () => 'Parent Ed-Org',
                  cell: (info) => <EdorgLink query={edorgs} id={info.row.original.parentId} />,
                },
                ...arrayElemIf(canShowOds, {
                  id: 'ods',
                  accessorFn: (info: GetEdorgDto) => getRelationDisplayName(info.odsId, odss),
                  header: () => 'ODS',
                  cell: (info: CellContext<GetEdorgDto, unknown>) => (
                    <OdsLink query={odss} id={info.row.original.odsId} />
                  ),
                }),
                {
                  id: 'discriminator',
                  accessorFn: (info) => info.discriminator,
                  header: () => 'Type',
                },
              ]}
            />
          </TabPanel>
        ),
      }
    : {
        Stat: null,
        Tab: null,
        TabContent: null,
      };
};
