import { ActionsType } from '@edanalytics/common-ui';
import { BiPlus } from 'react-icons/bi';
import { useNavigate, useParams } from 'react-router-dom';
import { teamBaseAuthConfig, useAuthorize, useTeamSbEnvironmentNavContext } from '../../helpers';

export const useEdfiTenantsActions = (): ActionsType => {
  const navigate = useNavigate();
  const { sbEnvironment, sbEnvironmentId, teamId } = useTeamSbEnvironmentNavContext();

  const { edfiTenantId } = useParams();

  const canPost = useAuthorize(
    teamBaseAuthConfig(sbEnvironmentId, teamId, 'team.sb-environment:create-tenant')
  );
  return canPost
    ? {
        Create: {
          icon: BiPlus,
          text: 'Create',
          title: 'Create new tenant.',
          to: `/as/${teamId}/sb-environments/${sbEnvironmentId}/edfi-tenants/create`,
          onClick: () =>
            edfiTenantId !== undefined &&
            navigate(`/as/${teamId}/sb-environments/${sbEnvironmentId}/edfi-tenants/create`),
        },
      }
    : {};
};
