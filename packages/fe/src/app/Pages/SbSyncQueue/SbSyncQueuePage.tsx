import _ from 'lodash';
import { useParams } from 'react-router-dom';
import { PageTemplate } from '../../Layout/PageTemplate';
import { sbSyncQueueQueries } from '../../api';
import { ActionBarActions } from '../../helpers';
import { ViewSbSyncQueue } from './ViewSbSyncQueue';
import { useSbSyncQueueActions } from './useSbSyncQueueActions';

export const SbSyncQueuePage = () => {
  const params = useParams() as { sbSyncQueueId: string };
  const sbSyncQueue = sbSyncQueueQueries.useOne({
    id: params.sbSyncQueueId,
  }).data;
  const actions = useSbSyncQueueActions(sbSyncQueue);
  return (
    <PageTemplate
      title={sbSyncQueue?.displayName || 'SbSyncQueue'}
      actions={<ActionBarActions actions={_.omit(actions, 'View')} />}
    >
      {sbSyncQueue ? <ViewSbSyncQueue /> : null}
    </PageTemplate>
  );
};
