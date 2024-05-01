import { ActionsType } from '@edanalytics/common-ui';
import { BiPlus } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { globalSbEnvironmentAuthConfig, useAuthorize } from '../../helpers';

export const useSbEnvironmentsGlobalActions = (): ActionsType => {
  const navigate = useNavigate();

  const canCreate = useAuthorize(
    globalSbEnvironmentAuthConfig('__filtered__', 'sb-environment:create')
  );

  return canCreate
    ? {
        Create: {
          icon: BiPlus,
          text: 'Connect',
          title: 'Connect new environment.',
          to: '/sb-environments/create',
          onClick: () => navigate('/sb-environments/create'),
        },
      }
    : {};
};
