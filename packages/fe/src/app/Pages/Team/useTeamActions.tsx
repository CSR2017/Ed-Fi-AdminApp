import { ActionsType } from '@edanalytics/common-ui';
import { GetTeamDto } from '@edanalytics/models';
import { useQueryClient } from '@tanstack/react-query';
import { BiArch, BiEdit, BiTrash, BiUserPlus } from 'react-icons/bi';
import { BsClipboardPlus } from 'react-icons/bs';
import { HiOutlineEye } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { usePopBanner } from '../../Layout/FeedbackBanner';
import { teamQueries } from '../../api';
import { globalTeamAuthConfig, useAuthorize } from '../../helpers';
import { mutationErrCallback } from '../../helpers/mutationErrCallback';

export const useTeamActions = (team: GetTeamDto | undefined): ActionsType => {
  const navigate = useNavigate();
  const popBanner = usePopBanner();
  const to = (id: number | string) => `/teams/${id}`;
  const queryClient = useQueryClient();
  const deleteTeam = teamQueries.delete({});

  const canAssume = useAuthorize(globalTeamAuthConfig('team:read'));
  const canInvite = useAuthorize(globalTeamAuthConfig('user-team-membership:create'));
  const canGrant = useAuthorize(globalTeamAuthConfig('ownership:create'));
  const canView = useAuthorize(globalTeamAuthConfig('team:read'));
  const canEdit = useAuthorize(globalTeamAuthConfig('team:update'));
  const canDelete = useAuthorize(globalTeamAuthConfig('team:delete'));

  return team === undefined
    ? {}
    : {
        ...(canAssume
          ? {
              Assume: {
                icon: BiArch,
                text: 'Assume',
                title: 'Assume ' + team.displayName + ' team scope',
                to: `/as/${team.id}`,
                onClick: () => navigate(`/as/${team.id}`),
              },
            }
          : {}),
        ...(canInvite
          ? {
              Invite: {
                icon: BiUserPlus,
                text: 'Add user',
                title: 'Add existing user to ' + team.displayName,
                to: `/user-team-memberships/create?teamId=${team.id}`,
                onClick: () => navigate(`/user-team-memberships/create?teamId=${team.id}`),
              },
            }
          : {}),
        ...(canGrant
          ? {
              Grant: {
                icon: BsClipboardPlus,
                text: 'Add resource',
                title: 'Give ' + team.displayName + ' a new resource ownership',
                to: `/ownerships/create?teamId=${team.id}`,
                onClick: () => navigate(`/ownerships/create?teamId=${team.id}`),
              },
            }
          : {}),
        ...(canView
          ? {
              View: {
                icon: HiOutlineEye,
                text: 'View',
                title: 'View ' + team.displayName,
                to: to(team.id),
                onClick: () => navigate(to(team.id)),
              },
            }
          : {}),
        ...(canEdit
          ? {
              Edit: {
                icon: BiEdit,
                text: 'Edit',
                title: 'Edit ' + team.displayName,
                to: to(team.id) + '?edit=true',
                onClick: () => navigate(to(team.id) + '?edit=true'),
              },
            }
          : {}),
        ...(canDelete
          ? {
              Delete: {
                icon: BiTrash,
                text: 'Delete',
                title: 'Delete team',
                confirmBody: 'This will permanently delete the team.',
                onClick: () =>
                  deleteTeam.mutateAsync(
                    { id: team.id },
                    {
                      ...mutationErrCallback({ popGlobalBanner: popBanner }),
                      onSuccess: () => {
                        queryClient.invalidateQueries({
                          queryKey: [],
                        });
                        navigate(`/teams`);
                      },
                    }
                  ),
                confirm: true,
              },
            }
          : {}),
      };
};
