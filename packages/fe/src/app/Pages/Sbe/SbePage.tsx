import { useParams } from '@tanstack/router';
import { ReactNode } from 'react';
import { sbeQueries } from '../../api';
import { sbeIndexRoute } from '../../routes';
import { PageTemplate } from '../PageTemplate';
import { ActionBarActions } from '../../helpers/ActionBarActions';
import { ViewSbe } from './ViewSbe';
import _ from 'lodash';

export const SbePage = (): ReactNode => {
  const params = useParams({ from: sbeIndexRoute.id });
  const sbe = sbeQueries.useOne({
    id: params.sbeId,
    tenantId: params.asId,
  }).data;

  const actions = {};

  return (
    <PageTemplate
      constrainWidth
      title={sbe?.displayName || 'Sbe'}
      actions={<ActionBarActions actions={_.omit(actions, 'View')} />}
    >
      {sbe ? <ViewSbe /> : null}
    </PageTemplate>
  );
};
