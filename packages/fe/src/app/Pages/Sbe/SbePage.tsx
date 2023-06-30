import { useParams } from 'react-router-dom';
import { ReactNode } from 'react';
import { sbeQueries } from '../../api';
import { sbeIndexRoute } from '../../routes';
import { PageTemplate } from '../PageTemplate';
import { ActionBarActions } from '../../helpers/ActionBarActions';
import { ViewSbe } from './ViewSbe';
import _ from 'lodash';

export const SbePage = () => {
  const params = useParams() as {
    asId: string;
    sbeId: string;
  };
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
