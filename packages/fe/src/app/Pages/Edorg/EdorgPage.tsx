import { useParams } from '@tanstack/router';
import { ReactNode } from 'react';
import { edorgQueries } from '../../api';
import { edorgIndexRoute } from '../../routes';
import { PageTemplate } from '../PageTemplate';
import { ViewEdorg } from './ViewEdorg';
import { ActionBarActions } from '../../helpers';
import _ from 'lodash';

export const EdorgPage = (): ReactNode => {
  const params = useParams({ from: edorgIndexRoute.id });
  const edorg = edorgQueries.useOne({
    id: params.edorgId,
    sbeId: params.sbeId,
    tenantId: params.asId,
  }).data;
  const actions = {};

  return (
    <PageTemplate
      constrainWidth
      title={edorg?.displayName || 'Edorg'}
      actions={<ActionBarActions actions={_.omit(actions, 'View')} />}
    >
      {edorg ? <ViewEdorg /> : null}
    </PageTemplate>
  );
};
