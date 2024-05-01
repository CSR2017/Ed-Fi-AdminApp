import { ActionsType } from '@edanalytics/common-ui';
import { BiPlus } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { globalUtmAuthConfig, useAuthorize } from '../../helpers';

export const useUtmsActionsGlobal = (): ActionsType => {
  const navigate = useNavigate();

  const canCreate = useAuthorize(globalUtmAuthConfig('user-team-membership:create'));
  return canCreate
    ? {
        Create: {
          icon: BiPlus,
          text: 'Create new',
          title: 'Create new team membership.',
          to: '/user-team-memberships/create',
          onClick: () => navigate('/user-team-memberships/create'),
        },
      }
    : {};
};
