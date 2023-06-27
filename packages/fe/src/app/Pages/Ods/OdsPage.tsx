import { useParams } from '@tanstack/router';
import _ from 'lodash';
import { ReactNode } from 'react';
import { odsQueries } from '../../api';
import { ActionBarActions } from '../../helpers';
import { odsIndexRoute } from '../../routes';
import { PageTemplate } from '../PageTemplate';
import { ViewOds } from './ViewOds';

export const OdsPage = (): ReactNode => {
  const params = useParams({ from: odsIndexRoute.id });
  const ods = odsQueries.useOne({
    id: params.odsId,
    sbeId: params.sbeId,
    tenantId: params.asId,
  }).data;

  const actions = {};
  return (
    <PageTemplate
      constrainWidth
      title={ods?.displayName || 'Ods'}
      actions={<ActionBarActions actions={_.omit(actions, 'View')} />}
    >
      {ods ? <ViewOds /> : null}
    </PageTemplate>
  );
};
