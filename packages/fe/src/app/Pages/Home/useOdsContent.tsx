import { Stat, StatLabel, StatNumber, Tab, TabPanel } from '@chakra-ui/react';
import { DataTable } from '@edanalytics/common-ui';
import { GetSbeDto } from '@edanalytics/models';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import {
  AuthorizeConfig,
  authorize,
  usePrivilegeCacheForConfig,
  useQueryIfAuth,
} from '../../helpers';
import { NameCell } from '../Ods/NameCell';
import { odsQueries } from '../../api';

export const useOdsContent = (props: { sbe: GetSbeDto }) => {
  const params = useParams() as { asId: string };
  const odsAuth: AuthorizeConfig = {
    privilege: 'tenant.sbe.ods:read',
    subject: {
      id: '__filtered__',
      sbeId: props.sbe.id,
      tenantId: Number(params.asId),
    },
  };
  const odss = odsQueries.useAll({ optional: true, tenantId: params.asId, sbeId: props.sbe.id });
  usePrivilegeCacheForConfig(odsAuth);
  const queryClient = useQueryClient();

  return authorize({ queryClient, config: odsAuth })
    ? {
        Stat: (
          <Stat flex="0 0 auto">
            <StatLabel>ODS's</StatLabel>
            <StatNumber>{Object.keys(odss.data ?? {}).length}</StatNumber>
          </Stat>
        ),
        Tab: <Tab>ODS's</Tab>,
        TabContent: (
          <TabPanel>
            <DataTable
              pageSizes={[5, 10, 15]}
              data={Object.values(odss?.data || {})}
              columns={[
                {
                  accessorKey: 'displayName',
                  cell: NameCell({ asId: params.asId, sbeId: String(props.sbe.id) }),
                  header: () => 'Name',
                },
                {
                  accessorKey: 'createdDetailed',
                  header: () => 'Created',
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
