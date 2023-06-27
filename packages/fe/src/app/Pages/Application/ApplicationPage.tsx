import { Box, Button, ButtonGroup, Heading } from '@chakra-ui/react';
import { ActionGroup, ConfirmAction } from '@edanalytics/common-ui';
import { useNavigate, useParams, useSearch } from '@tanstack/router';
import { ReactNode } from 'react';
import { BiEdit, BiTrash } from 'react-icons/bi';
import { applicationQueries } from '../../api';
import {
  AuthorizeComponent,
  applicationAuthConfig,
  useNavToParent,
} from '../../helpers';
import { applicationIndexRoute } from '../../routes';
import { EditApplication } from './EditApplication';
import { ViewApplication } from './ViewApplication';
import { useResetCredentials } from './useResetCredentials';
import { PageTemplate } from '../PageTemplate';
import {
  GetApplicationDto,
  createEdorgCompositeNaturalKey,
} from '@edanalytics/models';

export const ApplicationPage = (): ReactNode => {
  const navigate = useNavigate();
  const navToParentOptions = useNavToParent();

  const params = useParams({ from: applicationIndexRoute.id });

  const deleteApplication = applicationQueries.useDelete({
    sbeId: params.sbeId,
    tenantId: params.asId,
  });
  const application = applicationQueries.useOne({
    id: params.applicationId,
    sbeId: params.sbeId,
    tenantId: params.asId,
  }).data;
  const { edit } = useSearch({ from: applicationIndexRoute.id });

  const [ResetButton, ResetModal, ResetAlert] = useResetCredentials({
    application: application,
    sbeId: params.sbeId,
    tenantId: params.asId,
  });
  const tenantId = Number(params.asId);
  const sbeId = Number(params.sbeId);
  const id = application
    ? createEdorgCompositeNaturalKey({
        odsDbName: application.odsInstanceName,
        educationOrganizationId: application.educationOrganizationId,
      })
    : undefined;

  return (
    <PageTemplate
      constrainWidth
      title={application?.displayName || 'Application'}
      actions={
        application ? (
          <>
            <AuthorizeComponent
              config={applicationAuthConfig(
                id,
                sbeId,
                tenantId,
                'tenant.sbe.edorg.application:reset-credentials'
              )}
            >
              <ResetButton />
            </AuthorizeComponent>
            <AuthorizeComponent
              config={applicationAuthConfig(
                id,
                sbeId,
                tenantId,
                'tenant.sbe.edorg.application:update'
              )}
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
                Edit
              </Button>
            </AuthorizeComponent>
            <AuthorizeComponent
              config={applicationAuthConfig(
                id,
                sbeId,
                tenantId,
                'tenant.sbe.edorg.application:delete'
              )}
            >
              <ConfirmAction
                action={() =>
                  deleteApplication.mutate(application.id, {
                    onSuccess: () => navigate(navToParentOptions),
                  })
                }
                headerText={`Delete ${application.displayName}?`}
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
      {application ? (
        <>
          <ResetAlert />
          {edit ? (
            <EditApplication application={application} />
          ) : (
            <ViewApplication />
          )}
        </>
      ) : null}
    </PageTemplate>
  );
};
