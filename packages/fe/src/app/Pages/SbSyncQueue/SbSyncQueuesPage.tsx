import {
  Badge,
  HStack,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  chakra,
} from '@chakra-ui/react';
import { DataTable } from '@edanalytics/common-ui';
import { PgBossJobState, SbSyncQueueDto } from '@edanalytics/models';
import { CellContext } from '@tanstack/react-table';
import { PageTemplate } from '../../Layout/PageTemplate';
import { sbSyncQueueQueries, sbeQueries } from '../../api';
import { ActionBarActions, TableRowActions } from '../../helpers';
import { getRelationDisplayName } from '../../helpers/getRelationDisplayName';
import { SbSyncQueueLink, SbeGlobalLink } from '../../routes';
import { useSbSyncQueueActions } from './useSbSyncQueueActions';
import { useSbSyncQueuesActions } from './useSbSyncQueuesActions';
import dayjs from 'dayjs';

export const jobStateColorSchemes: Record<PgBossJobState, string> = {
  active: 'purple',
  cancelled: 'orange',
  completed: 'green',
  created: 'blue',
  expired: 'orange',
  failed: 'red',
  retry: 'yellow',
};

const SbSyncQueueNameCell = (info: CellContext<SbSyncQueueDto, unknown>) => {
  const sbSyncQueues = sbSyncQueueQueries.useAll({});
  const actions = useSbSyncQueueActions(info.row.original);
  return (
    <HStack justify="space-between">
      <SbSyncQueueLink id={info.row.original.id} query={sbSyncQueues} />
      <TableRowActions actions={actions} />
    </HStack>
  );
};

export const SbSyncQueuesPage = () => {
  const sbSyncQueues = sbSyncQueueQueries.useAll({});
  const actions = useSbSyncQueuesActions();
  const sbes = sbeQueries.useAll({});

  return (
    <PageTemplate title="SB Environment Sync" actions={<ActionBarActions actions={actions} />}>
      <DataTable
        data={Object.values(sbSyncQueues?.data || {})}
        columns={[
          {
            accessorKey: 'displayName',
            cell: SbSyncQueueNameCell,
            header: () => 'Name',
          },
          {
            id: 'sbe',
            accessorFn: (info) => getRelationDisplayName(info.sbeId, sbes),
            header: () => 'Environment',
            cell: (info) => <SbeGlobalLink query={sbes} id={info.row.original.sbeId} />,
          },
          {
            accessorKey: 'state',
            header: () => 'State',
            cell: (info) => (
              <Badge colorScheme={jobStateColorSchemes[info.row.original.state]}>
                {info.row.original.state}
              </Badge>
            ),
          },
          {
            id: 'output',
            accessorFn: (info) =>
              info.output === null ? null : JSON.stringify(info.output, null, 2),
            cell: (info) =>
              info.getValue() ? (
                <Popover trigger="hover" autoFocus={false}>
                  {({ isOpen, onClose }) => (
                    <>
                      <PopoverTrigger>
                        <Text
                          as="button"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                          overflow="hidden"
                          maxW="9em"
                        >
                          {info.getValue() as string}
                        </Text>
                      </PopoverTrigger>
                      <PopoverContent
                        boxShadow="lg"
                        minH="10em"
                        minW="30em"
                        maxW="50em"
                        w="auto"
                        overflow="auto"
                        display={!isOpen ? 'none' : undefined}
                      >
                        <PopoverBody>
                          <chakra.pre whiteSpace="break-spaces">
                            {info.getValue() as string}
                          </chakra.pre>
                        </PopoverBody>
                      </PopoverContent>
                    </>
                  )}
                </Popover>
              ) : null,
            header: () => 'Output',
          },
          {
            accessorKey: 'createdDetailed',
            header: () => 'Created',
          },
          {
            accessorKey: 'completedDetailed',
            header: () => 'Completed',
          },
          {
            id: 'duration',
            accessorFn: (info) =>
              info.completedon && info.createdon
                ? dayjs(info.completedon).diff(info.createdon)
                : null,
            cell: (info) => info.row.original.durationDetailed,
            header: () => 'Duration',
          },
        ]}
      />
    </PageTemplate>
  );
};
