import _ from 'lodash';
import { useParams } from 'react-router-dom';
import { claimsetQueries } from '../../api';
import { ActionBarActions } from '../../helpers';
import { PageTemplate } from '../PageTemplate';
import { ViewClaimset } from './ViewClaimset';
import { useClaimsetActions } from './useClaimsetActions';
import { ErrorBoundary } from 'react-error-boundary';

export const ClaimsetPage = () => {
  return (
    <PageTemplate
      constrainWidth
      title={
        <ErrorBoundary fallbackRender={() => 'Claimset'}>
          <ClaimsetPageTitle />
        </ErrorBoundary>
      }
      actions={<ClaimsetPageActions />}
    >
      <ClaimsetPageContent />
    </PageTemplate>
  );
};

export const ClaimsetPageTitle = () => {
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

  return <>{claimset?.displayName || 'Claimset'}</>;
};

export const ClaimsetPageContent = () => {
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

  return claimset ? <ViewClaimset /> : null;
};
export const ClaimsetPageActions = () => {
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

  return <ActionBarActions actions={_.omit(actions, 'View')} />;
};
