import { Badge, FormLabel, Text, chakra } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { sbSyncQueueQueries, sbeQueries } from '../../api';
import { SbeGlobalLink } from '../../routes';
import { jobStateColorSchemes } from './SbSyncQueuesPage';
import _ from 'lodash';
import { Attribute, AttributeContainer } from '@edanalytics/common-ui';

export const ViewSbSyncQueue = () => {
  const params = useParams() as { sbSyncQueueId: string };
  const sbSyncQueue = sbSyncQueueQueries.useOne({
    id: params.sbSyncQueueId,
  }).data;
  const sbes = sbeQueries.useAll({});

  const output = sbSyncQueue?.output ?? null;
  const stack =
    sbSyncQueue?.output && 'stack' in sbSyncQueue.output ? sbSyncQueue.output.stack ?? null : null;

  return sbSyncQueue ? (
    <>
      <Attribute label="Name" value={sbSyncQueue.name} />
      <AttributeContainer label="Environment">
        <SbeGlobalLink query={sbes} id={sbSyncQueue.sbeId} />
      </AttributeContainer>
      <Attribute label="Created" isDate value={sbSyncQueue.createdon} />
      <Attribute label="Completed" isDate value={sbSyncQueue.completedon} />
      <Attribute label="Duration" value={sbSyncQueue.durationDetailed} />
      <AttributeContainer label="State">
        <Badge colorScheme={jobStateColorSchemes[sbSyncQueue.state]}>{sbSyncQueue.state}</Badge>
      </AttributeContainer>
      <AttributeContainer label="Output">
        {output ? (
          <chakra.pre whiteSpace="break-spaces">{JSON.stringify(output, null, 2)}</chakra.pre>
        ) : null}
      </AttributeContainer>
      {stack ? (
        <AttributeContainer label="Stack trace">
          <chakra.pre whiteSpace="break-spaces">{stack as string}</chakra.pre>
        </AttributeContainer>
      ) : null}
    </>
  ) : null;
};
