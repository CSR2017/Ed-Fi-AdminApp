import { GetSbEnvironmentDto, OWNERSHIP_RESOURCE_TYPE } from '@edanalytics/models';
import { BiData, BiDownload, BiRefresh, BiRename, BiShieldPlus, BiTrash } from 'react-icons/bi';
import { HiOutlineEye } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { usePopBanner } from '../../Layout/FeedbackBanner';
import { sbEnvironmentQueriesGlobal } from '../../api';
import {
  globalOwnershipAuthConfig,
  globalSbEnvironmentAuthConfig,
  popSyncBanner,
  useAuthorize,
} from '../../helpers';
import { mutationErrCallback } from '../../helpers/mutationErrCallback';
import { useSearchParamsObject } from '../../helpers/useSearch';

export const useSbEnvironmentGlobalActions = (sbEnvironment: GetSbEnvironmentDto | undefined) => {
  const refreshResources = sbEnvironmentQueriesGlobal.refreshResources({});
  const deleteSbEnvironment = sbEnvironmentQueriesGlobal.delete({});
  const reloadTenants = sbEnvironmentQueriesGlobal.reloadTenants({});

  const searchParams = useSearchParamsObject();
  const edit = 'edit' in searchParams ? searchParams.edit : undefined;

  const popBanner = usePopBanner();

  const navigate = useNavigate();

  const canGrantOwnership = useAuthorize(globalOwnershipAuthConfig('ownership:create'));
  const canView = useAuthorize(
    globalSbEnvironmentAuthConfig(sbEnvironment?.id, 'sb-environment:read')
  );
  const canUpdate = useAuthorize(
    globalSbEnvironmentAuthConfig(sbEnvironment?.id, 'sb-environment:update')
  );
  const canDelete = useAuthorize(
    globalSbEnvironmentAuthConfig(sbEnvironment?.id, 'sb-environment:delete')
  );
  const canRefreshResources = useAuthorize(
    globalSbEnvironmentAuthConfig(sbEnvironment?.id, 'sb-environment:refresh-resources')
  );

  return sbEnvironment === undefined
    ? {}
    : {
        ...(canGrantOwnership
          ? {
              GrantOwnership: {
                icon: BiShieldPlus,
                text: 'Grant ownership',
                title: 'Grant ownership of ' + sbEnvironment.displayName,
                to: `/ownerships/create?sbEnvironmentId=${sbEnvironment.id}&type=${OWNERSHIP_RESOURCE_TYPE.sbEnvironment}`,
                onClick: () =>
                  navigate(
                    `/ownerships/create?sbEnvironmentId=${sbEnvironment.id}&type=${OWNERSHIP_RESOURCE_TYPE.sbEnvironment}`
                  ),
              },
            }
          : {}),
        ...(canView
          ? {
              View: {
                icon: HiOutlineEye,
                text: 'View',
                title: 'View ' + sbEnvironment.displayName,
                to: `/sb-environments/${sbEnvironment.id}`,
                onClick: () => navigate(`/sb-environments/${sbEnvironment.id}`),
              },
            }
          : {}),
        ...(canUpdate
          ? {
              EditSbMeta: {
                isIrrelevant: !!sbEnvironment.configPublic?.sbEnvironmentMetaArn,
                isDisabled: edit === 'sb-environment-meta',
                icon: BiData,
                text: 'Connect SB Meta',
                title: 'Setup connection to Starting Blocks metadata API',
                to: `/sb-environments/${sbEnvironment.id}?edit=sb-environment-meta`,
                onClick: () =>
                  navigate(`/sb-environments/${sbEnvironment.id}?edit=sb-environment-meta`),
              },
            }
          : {}),
        ...(canUpdate
          ? {
              Rename: {
                isDisabled: edit === 'name',
                icon: BiRename,
                text: 'Rename',
                title: 'Rename the environment',
                to: `/sb-environments/${sbEnvironment.id}?edit=name`,
                onClick: () => navigate(`/sb-environments/${sbEnvironment.id}?edit=name`),
              },
            }
          : {}),
        ...(canDelete
          ? {
              Delete: {
                icon: BiTrash,
                isPending: deleteSbEnvironment.isPending,
                text: 'Delete',
                title: 'Delete environment',
                confirmBody: 'This will permanently delete the environment.',
                onClick: () =>
                  deleteSbEnvironment.mutateAsync(
                    { id: sbEnvironment.id },
                    {
                      ...mutationErrCallback({ popGlobalBanner: popBanner }),
                      onSuccess: () => navigate(`/sb-environments`),
                    }
                  ),
                confirm: true,
              },
            }
          : {}),
        ...(canRefreshResources
          ? {
              RefreshResources: {
                icon: BiDownload,
                isPending: refreshResources.isPending,
                text: 'Sync with SB',
                title: 'Sync ODSs and Ed-Orgs from Starting Blocks to SBAA.',
                onClick: async () => {
                  await refreshResources.mutateAsync(
                    { entity: sbEnvironment, pathParams: null },
                    {
                      ...mutationErrCallback({ popGlobalBanner: popBanner }),
                      onSuccess(result, variables, context) {
                        popSyncBanner({
                          popBanner,
                          syncQueue: result,
                        });
                      },
                    }
                  );
                },
              },
            }
          : {}),
        ...(canUpdate && sbEnvironment.version === 'v2'
          ? {
              Restart: {
                isPending: reloadTenants.isPending,
                icon: BiRefresh,
                text: 'Reload tenants',
                title: 'Reload tenants in the Admin API server',
                onClick: async () => {
                  await reloadTenants.mutateAsync(
                    { entity: sbEnvironment, pathParams: null },
                    {
                      ...mutationErrCallback({ popGlobalBanner: popBanner }),
                      onSuccess(result, variables, context) {
                        popBanner(result);
                      },
                    }
                  );
                },
              },
            }
          : {}),
      };
};
