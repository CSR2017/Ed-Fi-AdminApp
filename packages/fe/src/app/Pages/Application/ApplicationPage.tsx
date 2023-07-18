import _ from 'lodash';
import { useParams } from 'react-router-dom';
import { applicationQueries } from '../../api';
import { ActionBarActions } from '../../helpers';
import { useSearchParamsObject } from '../../helpers/useSearch';
import { PageTemplate } from '../PageTemplate';
import { EditApplication } from './EditApplication';
import { ViewApplication } from './ViewApplication';
import { useApplicationActions } from './useApplicationActions';

export const ApplicationPage = () => {
  const params = useParams() as {
    sbeId: string;
    asId: string;
    applicationId: string;
  };

  const application = applicationQueries.useOne({
    id: params.applicationId,
    sbeId: params.sbeId,
    tenantId: params.asId,
  }).data;
  const { edit } = useSearchParamsObject();

  const actions = useApplicationActions({
    application,
    sbeId: params.sbeId,
    tenantId: params.asId,
  });

  return (
    <PageTemplate
      constrainWidth
      title={application?.displayName || 'Application'}
      actions={<ActionBarActions actions={_.omit(actions, 'View')} />}
    >
      {application ? (
        edit ? (
          <EditApplication application={application} />
        ) : (
          <ViewApplication />
        )
      ) : null}
    </PageTemplate>
  );
};
