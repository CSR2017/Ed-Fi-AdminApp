import { GetApplicationDto } from '@edanalytics/models';
import {
  ActionPropsConfirm,
  ActionsType,
  AuthorizeComponent,
  LinkActionProps,
} from '../../helpers';
import { HiOutlineEye } from 'react-icons/hi';
import { applicationPostRoute } from '../../routes';
import { BiPlus, BiShieldX } from 'react-icons/bi';
import { Link, useNavigate } from '@tanstack/router';
import { useResetCredentials } from './useResetCredentials';
import {
  useClipboard,
  Modal,
  Text,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Spinner,
} from '@chakra-ui/react';
import { useApplicationResetCredential } from '../../api';

export const useApplicationActions = ({
  application,
  sbeId,
  tenantId,
}: {
  application: GetApplicationDto | undefined;
  sbeId: string;
  tenantId: string;
}): ActionsType => {
  const navigate = useNavigate();

  const clipboard = useClipboard('');

  const resetCreds = useApplicationResetCredential({
    sbeId: sbeId,
    tenantId: tenantId,
    callback: (result) => {
      clipboard.setValue(result.link);
    },
  });
  const onClose = () => {
    clipboard.setValue('');
  };

  return application === undefined
    ? {}
    : {
        Reset: (props: {
          children: (props: ActionPropsConfirm) => JSX.Element;
        }) => {
          const toOptions = {
            to: applicationPostRoute.fullPath,
            params: (old: any) => old,
          };
          return (
            <>
              <Modal isOpen={clipboard.value !== ''} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Success!</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <Text as="p">
                      Use this one-time link to see your Key and Secret:
                    </Text>
                    <Link href={clipboard.value} color="blue.600">
                      {clipboard.value}
                    </Link>
                    <Text my={5} as="p" fontStyle="italic">
                      Note: this link will work only once, and will expire after
                      7 days.
                    </Text>
                  </ModalBody>
                </ModalContent>
              </Modal>
              <AuthorizeComponent
                config={{
                  privilege: 'tenant.sbe.edorg.application:reset-credentials',
                  subject: {
                    sbeId: Number(sbeId),
                    tenantId: Number(tenantId),
                    id: '__filtered__',
                  },
                }}
              >
                <props.children
                  icon={() =>
                    resetCreds.isLoading ? <Spinner size="sm" /> : <BiShieldX />
                  }
                  text="New"
                  title="New application"
                  onClick={() => {
                    resetCreds.mutate(application);
                  }}
                  confirm
                  confirmBody="Are you sure you want to reset the credentials? Anything using the current ones will stop working."
                />
              </AuthorizeComponent>
            </>
          );
        },
      };
};
export const useApplicationsActions = ({
  sbeId,
  tenantId,
}: {
  sbeId: string;
  tenantId: string;
}): ActionsType => {
  const navigate = useNavigate();

  const clipboard = useClipboard('');

  const resetCreds = useApplicationResetCredential({
    sbeId: sbeId,
    tenantId: tenantId,
    callback: (result) => {
      clipboard.setValue(result.link);
    },
  });
  const onClose = () => {
    clipboard.setValue('');
  };

  return {
    Create: (props: { children: (props: LinkActionProps) => JSX.Element }) => {
      const toOptions = {
        to: applicationPostRoute.fullPath,
        params: (old: any) => old,
      };
      return (
        <AuthorizeComponent
          config={{
            privilege: 'tenant.sbe.edorg.application:create',
            subject: {
              sbeId: Number(sbeId),
              tenantId: Number(tenantId),
              id: '__filtered__',
            },
          }}
        >
          <props.children
            icon={BiPlus}
            text="New"
            title="New application"
            linkProps={toOptions}
            onClick={() => navigate(toOptions)}
          />
        </AuthorizeComponent>
      );
    },
  };
};
