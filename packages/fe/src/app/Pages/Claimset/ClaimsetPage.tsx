import _ from 'lodash';
import { useParams } from 'react-router-dom';
import { claimsetQueries } from '../../api';
import { ActionBarActions } from '../../helpers';
import { PageTemplate } from '../PageTemplate';
import { ViewClaimset } from './ViewClaimset';
import { useClaimsetActions } from './useClaimsetActions';

export const ClaimsetPage = () => {
  const params = useParams() as {
    asId: string;
    sbeId: string;
    claimsetId: string;
  };
  const claimset = claimsetQueries.useOne({
    enabled: params.asId !== undefined,
    id: params.claimsetId,
    sbeId: params.sbeId,
    tenantId: params.asId,
  }).data;

  const actions = useClaimsetActions({
    claimset,
    sbeId: params.sbeId,
    tenantId: params.asId,
  });

  return (
    <PageTemplate
      constrainWidth
      title={claimset?.displayName || 'Claimset'}
      actions={<ActionBarActions actions={_.omit(actions, 'View')} />}
    >
      {claimset ? <ViewClaimset /> : null}
    </PageTemplate>
  );
};
