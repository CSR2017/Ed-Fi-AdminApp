import {
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  UnorderedList,
  useBoolean,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { SuccessFailureBadge } from '@edanalytics/common-ui';
import { GetSbeDto, SbeCheckConnectionDto } from '@edanalytics/models';
import { useNavigate, useRouter } from '@tanstack/router';
import { useState } from 'react';
import {
  BiCog,
  BiData,
  BiDownload,
  BiKey,
  BiPlug,
  BiTrash,
} from 'react-icons/bi';
import { HiOutlineEye } from 'react-icons/hi';
import {
  sbeQueries,
  useSbeCheckConnection,
  useSbeRefreshResources,
} from '../../api';
import { AuthorizeComponent } from '../../helpers';
import {
  ActionProps,
  ActionPropsConfirm,
  ActionsType,
  LinkActionProps,
} from '../../helpers/ActionsType';
import {
  ownershipGlobalCreateRoute,
  sbeGlobalRoute,
  sbesGlobalRoute,
} from '../../routes';

export const useSbeGlobalActions = (
  sbe: GetSbeDto | undefined
): ActionsType => {
  const toast = useToast();

  const checkConnection = useSbeCheckConnection();
  const [checkLoading, setCheckLoading] = useBoolean(false);
  const checkAlert = useDisclosure();
  const [checkResult, setCheckResult] = useState<null | SbeCheckConnectionDto>(
    null
  );

  const refreshResources = useSbeRefreshResources();
  const [refreshLoading, setRefreshLoading] = useBoolean(false);

  const deleteSbe = sbeQueries.useDelete({});
  const searchParams = useRouter().state.currentLocation.search;
  const edit = 'edit' in searchParams ? searchParams.edit : undefined;

  const navigate = useNavigate();
  const path = sbeGlobalRoute.fullPath;
  return sbe === undefined
    ? {}
    : {
        GrantOwnership: (props: {
          children: (props: LinkActionProps) => JSX.Element;
        }) => {
          const toOptions = {
            to: ownershipGlobalCreateRoute.fullPath,
            search: {
              sbeId: sbe.id,
              type: 'sbe' as 'sbe',
            },
          };
          return (
            <AuthorizeComponent
              config={{
                privilege: 'ownership:create',
                subject: {
                  id: '__filtered__',
                },
              }}
            >
              <props.children
                icon={BiKey}
                text="Grant ownership"
                title={'Grant ownership of ' + sbe.displayName}
                linkProps={toOptions}
                onClick={() => navigate(toOptions)}
              />
            </AuthorizeComponent>
          );
        },
        View: (props: {
          children: (props: LinkActionProps) => JSX.Element;
        }) => {
          const toOptions = {
            to: path,
            params: (old: any) => ({ ...old, sbeId: String(sbe.id) }),
          };
          return (
            <AuthorizeComponent
              config={{
                privilege: 'sbe:read',
                subject: {
                  id: sbe.id,
                },
              }}
            >
              <props.children
                icon={HiOutlineEye}
                text="View"
                title={'View ' + sbe.displayName}
                linkProps={toOptions}
                onClick={() => navigate(toOptions)}
              />
            </AuthorizeComponent>
          );
        },
        CheckConnection: (props: {
          children: (props: ActionProps) => JSX.Element;
        }) => {
          return (
            <>
              {checkResult && (
                <Modal isOpen={checkAlert.isOpen} onClose={checkAlert.onClose}>
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>Connection not successful</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                      <Text as="p">
                        Admin API:{' '}
                        <SuccessFailureBadge
                          pastTense
                          bool={checkResult.adminApi}
                        />
                      </Text>
                      <Text as="p">
                        SB Meta:{' '}
                        <SuccessFailureBadge
                          pastTense
                          bool={checkResult.sbMeta}
                        />
                      </Text>
                      <Text as="p">Messages:</Text>
                      <UnorderedList>
                        {checkResult.messages.map((m) => (
                          <ListItem>{m}</ListItem>
                        ))}
                      </UnorderedList>
                    </ModalBody>
                  </ModalContent>
                </Modal>
              )}
              <AuthorizeComponent
                config={{
                  privilege: 'sbe:read',
                  subject: {
                    id: sbe.id,
                  },
                }}
              >
                <props.children
                  icon={() =>
                    checkLoading ? <Spinner size="sm" /> : <BiPlug />
                  }
                  text="Check connection"
                  title="Check connection to Starting Blocks and Ed-Fi Admin API"
                  onClick={async () => {
                    setCheckLoading.on();
                    const result = await checkConnection.mutateAsync(sbe);
                    const totalSuccess = result.adminApi && result.sbMeta;
                    if (totalSuccess) {
                      toast({
                        title: 'Connection successful.',
                        duration: 5000,
                        colorScheme: 'green',
                        isClosable: true,
                      });
                    } else {
                      setCheckResult(result);
                      checkAlert.onOpen();
                    }
                    setCheckLoading.off();
                  }}
                />
              </AuthorizeComponent>
            </>
          );
        },
        RefreshResources: (props: {
          children: (props: ActionProps) => JSX.Element;
        }) => {
          return (
            <AuthorizeComponent
              config={{
                privilege: 'sbe:refresh-resources',
                subject: {
                  id: sbe.id,
                },
              }}
            >
              <props.children
                icon={() =>
                  refreshLoading ? <Spinner size="sm" /> : <BiDownload />
                }
                text="Sync with SB"
                title="Sync ODSs and Ed-Orgs from Starting Blocks to SBAA."
                onClick={async () => {
                  setRefreshLoading.on();
                  try {
                    const result = await refreshResources.mutateAsync(sbe);
                    toast({
                      title: 'Refresh completed.',
                      colorScheme: 'green',
                      description: `${result.odsCount} ODS's. ${result.edorgCount} Ed-Orgs.`,
                      duration: 9000,
                      isClosable: true,
                    });
                  } catch (refreshFailed) {
                    console.log(refreshFailed);

                    toast({
                      colorScheme: 'red',
                      title: 'Refresh failed.',
                      description: String(refreshFailed),
                      duration: 20000,
                      isClosable: true,
                    });
                  }
                  setRefreshLoading.off();
                }}
              />
            </AuthorizeComponent>
          );
        },
        EditSbMeta: (props: {
          children: (props: LinkActionProps) => JSX.Element;
        }) => {
          const toOptions = {
            to: path,
            params: (old: any) => ({ ...old, sbeId: String(sbe.id) }),
            search: { edit: 'sbe-meta' as 'sbe-meta' },
          };
          return (
            <AuthorizeComponent
              config={{
                privilege: 'sbe:update',
                subject: {
                  id: sbe.id,
                },
              }}
            >
              <props.children
                isDisabled={edit === 'sbe-meta'}
                icon={BiData}
                text="Connect SB Meta"
                title="Setup connection to Starting Blocks metadata API"
                linkProps={toOptions}
                onClick={() => navigate(toOptions)}
              />
            </AuthorizeComponent>
          );
        },
        RegisterAdminApi: (props: {
          children: (props: LinkActionProps) => JSX.Element;
        }) => {
          const toOptions = {
            to: path,
            params: (old: any) => ({ ...old, sbeId: String(sbe.id) }),
            search: { edit: 'admin-api' as 'admin-api' },
          };
          return (
            <AuthorizeComponent
              config={{
                privilege: 'sbe:update',
                subject: {
                  id: sbe.id,
                },
              }}
            >
              <props.children
                isDisabled={edit === 'admin-api'}
                icon={BiCog}
                text="Connect Admin API"
                title="Setup connection to Ed-Fi Admin API"
                linkProps={toOptions}
                onClick={() => navigate(toOptions)}
              />
            </AuthorizeComponent>
          );
        },
        Delete: (props: {
          children: (props: ActionPropsConfirm) => JSX.Element;
        }) => {
          return (
            <AuthorizeComponent
              config={{
                privilege: 'sbe:update',
                subject: {
                  id: sbe.id,
                },
              }}
            >
              <props.children
                icon={BiTrash}
                text="Delete"
                title="Delete environment"
                confirmBody="This will permanently delete the environment."
                onClick={() =>
                  deleteSbe.mutateAsync(sbe.id, {
                    onSuccess: () => navigate({ to: sbesGlobalRoute.fullPath }),
                  })
                }
                confirm={true}
              />
            </AuthorizeComponent>
          );
        },
      };
};
