import {
  Box,
  Button,
  ButtonGroup,
  Heading,
  Spinner,
  useBoolean,
  useToast,
} from '@chakra-ui/react';
import { ActionGroup, ConfirmAction } from '@edanalytics/common-ui';
import { useNavigate, useParams, useSearch } from '@tanstack/router';
import { ReactNode } from 'react';
import { BiEdit, BiRefresh, BiTrash } from 'react-icons/bi';
import { GoRadioTower } from 'react-icons/go';
import {
  sbeQueries,
  useSbeCheckConnection,
  useSbeRefreshResources,
} from '../../api';
import { AuthorizeComponent, useNavToParent } from '../../helpers';
import { sbeGlobalIndexRoute } from '../../routes';
import { EditSbeGlobal } from './EditSbeGlobal';
import { ViewSbeGlobal } from './ViewSbeGlobal';
import { PageTemplate } from './PageTemplate';

export const SbeGlobalPage = (): ReactNode => {
  const navigate = useNavigate();
  const navToParentOptions = useNavToParent();

  const params = useParams({ from: sbeGlobalIndexRoute.id });
  const deleteSbe = sbeQueries.useDelete({
    callback: () => {
      navigate(navToParentOptions);
    },
  });
  const sbe = sbeQueries.useOne({
    id: params.sbeId,
  }).data;
  const { edit } = useSearch({ from: sbeGlobalIndexRoute.id });
  const toast = useToast();
  const [checkLoading, setCheckLoading] = useBoolean(false);
  const [refreshLoading, setRefreshLoading] = useBoolean(false);

  const checkConnection = useSbeCheckConnection();
  const refreshResources = useSbeRefreshResources();

  return (
    <PageTemplate
      constrainWidth
      title={sbe?.displayName || 'Sbe'}
      actions={
        sbe ? (
          <>
            <AuthorizeComponent
              config={{
                privilege: 'sbe:refresh-resources',
                subject: {
                  id: params.sbeId,
                },
              }}
            >
              <Button
                title="Reload ODSs and Ed-Orgs from Starting Blocks and sync to the SBAA database."
                isDisabled={refreshLoading}
                leftIcon={
                  refreshLoading ? <Spinner size="sm" /> : <BiRefresh />
                }
                onClick={async () => {
                  setRefreshLoading.on();
                  try {
                    const result = await refreshResources.mutateAsync(sbe);
                    toast({
                      title: 'Refresh completed.',
                      description: `${result.odsCount} total ODS's. ${result.edorgCount} total Ed-Orgs.`,
                      duration: 5000,
                      isClosable: true,
                    });
                  } catch (refreshFailed) {
                    toast({
                      title: 'Refresh failed.',
                      description: String(refreshFailed),
                      duration: 20000,
                      isClosable: true,
                    });
                  }
                  setRefreshLoading.off();
                }}
              >
                Sync contents
              </Button>
            </AuthorizeComponent>
            <AuthorizeComponent
              config={{
                privilege: 'sbe:read',
                subject: {
                  id: params.sbeId,
                },
              }}
            >
              <Button
                title="Test connections and credentials to the Ed-Fi Admin API and Starting Blocks, but don't run a sync or change any data."
                isDisabled={checkLoading}
                leftIcon={
                  checkLoading ? <Spinner size="sm" /> : <GoRadioTower />
                }
                onClick={async () => {
                  setCheckLoading.on();
                  const result = await checkConnection.mutateAsync(sbe);
                  toast({
                    title: 'Connection check completed.',
                    description:
                      result.adminApi && result.sbMeta
                        ? 'Connection successful.'
                        : result.adminApi
                        ? 'Admin API connection successful. SB meta unsuccessful.'
                        : result.sbMeta
                        ? 'SB meta connection successful. Admin API unsuccessful.'
                        : 'Connection unsuccessful.',
                    duration: 9000,
                    colorScheme:
                      result.adminApi && result.sbMeta
                        ? 'green'
                        : result.adminApi || result.sbMeta
                        ? 'yellow'
                        : 'red',
                    isClosable: true,
                  });
                  setCheckLoading.off();
                }}
              >
                Check connection
              </Button>
            </AuthorizeComponent>
            <AuthorizeComponent
              config={{
                privilege: 'sbe:update',
                subject: {
                  id: params.sbeId,
                },
              }}
            >
              <Button
                isDisabled={edit}
                leftIcon={<BiEdit />}
                onClick={() => {
                  navigate({
                    search: { edit: true },
                  });
                }}
              >
                Edit config
              </Button>
            </AuthorizeComponent>
            <AuthorizeComponent
              config={{
                privilege: 'sbe:delete',
                subject: {
                  id: params.sbeId,
                },
              }}
            >
              <ConfirmAction
                action={() => deleteSbe.mutate(sbe.id)}
                headerText={`Delete ${sbe.displayName}?`}
                bodyText="You won't be able to get it back"
              >
                {(props) => (
                  <Button {...props} leftIcon={<BiTrash />}>
                    Delete
                  </Button>
                )}
              </ConfirmAction>
            </AuthorizeComponent>
          </>
        ) : null
      }
    >
      {sbe ? edit ? <EditSbeGlobal /> : <ViewSbeGlobal /> : null}
    </PageTemplate>
  );
};
