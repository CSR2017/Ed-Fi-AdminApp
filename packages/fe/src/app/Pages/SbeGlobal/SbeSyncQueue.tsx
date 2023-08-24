import {
  Badge,
  FormLabel,
  Link,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Text,
  chakra,
} from '@chakra-ui/react';
import { AttributeContainer, DataTable } from '@edanalytics/common-ui';
import { GetSbeDto } from '@edanalytics/models';
import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { sbSyncQueueQueries } from '../../api';
import { jobStateColorSchemes } from '../SbSyncQueue/SbSyncQueuesPage';

export const SbeSyncQueue = (props: { sbe: GetSbeDto }) => {
  const sbSyncQueues = sbSyncQueueQueries.useAll({});
  const filteredQueues = useMemo(
    () => Object.values(sbSyncQueues.data ?? {}).filter((q) => q.sbeId === props.sbe.id),
    [sbSyncQueues, props.sbe.id]
  );

  return (
    <AttributeContainer label="Sync queue">
      <DataTable
        data={filteredQueues}
        columns={[
          {
            id: 'displayName',
            accessorFn: (info) => info.createdDetailed,
            cell: (info) => (
              <Link as={RouterLink} to={`/sb-sync-queues/${info.row.original.id}`}>
                Created on {info.row.original.createdDetailed}
              </Link>
            ),
            header: () => 'Item',
          },
          {
            accessorKey: 'completedDetailed',
            header: () => 'Completed',
          },
          {
            accessorKey: 'durationDetailed',
            header: () => 'Duration',
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
        ]}
      />
    </AttributeContainer>
  );
};
