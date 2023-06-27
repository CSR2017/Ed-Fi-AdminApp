import { Box, Button, ButtonGroup, Heading } from '@chakra-ui/react';
import { ActionGroup, ConfirmAction } from '@edanalytics/common-ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams, useSearch } from '@tanstack/router';
import { BiEdit, BiTrash } from 'react-icons/bi';
import { userQueries } from '../../api';
import { userIndexRoute } from '../../routes';
import { useNavToParent } from '../../helpers';
import { EditUser } from './EditUser';
import { ViewUser } from './ViewUser';
import { ReactNode } from 'react';
import { PageTemplate } from '../PageTemplate';
import { ActionBarActions } from '../../helpers/ActionBarActions';
import _ from 'lodash';

export const UserPage = (): ReactNode => {
  const navigate = useNavigate();
  const navToParentOptions = useNavToParent();

  const params = useParams({ from: userIndexRoute.id });
  const deleteUser = userQueries.useDelete({
    callback: () => {
      navigate(navToParentOptions);
    },
    tenantId: params.asId,
  });
  const user = userQueries.useOne({
    id: params.userId,
    tenantId: params.asId,
  }).data;
  const { edit } = useSearch({ from: userIndexRoute.id });

  const actions = {};

  return (
    <PageTemplate
      constrainWidth
      title={user?.displayName || 'User'}
      actions={<ActionBarActions actions={_.omit(actions, 'View')} />}
    >
      {user ? edit ? <EditUser /> : <ViewUser /> : null}
    </PageTemplate>
  );
};
