import { Button } from '@chakra-ui/react';
import { ConfirmAction } from '@edanalytics/common-ui';
import { createEdorgCompositeNaturalKey } from '@edanalytics/models';
import { BiEdit, BiTrash } from 'react-icons/bi';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { applicationQueries } from '../../api';
import { AuthorizeComponent, applicationAuthConfig, useNavToParent } from '../../helpers';
import { useSearchParamsObject } from '../../helpers/useSearch';
import { PageTemplate } from '../PageTemplate';
import { EditApplication } from './EditApplication';
import { ViewApplication } from './ViewApplication';
import { useResetCredentials } from './useResetCredentials';

export const ApplicationPage = () => {
  const navigate = useNavigate();
  const navToParentOptions = useNavToParent();

  const params = useParams() as {
    sbeId: string;
    asId: string;
    applicationId: string;
  };

  const deleteApplication = applicationQueries.useDelete({
    sbeId: params.sbeId,
    tenantId: params.asId,
  });
  const application = applicationQueries.useOne({
    id: params.applicationId,
    sbeId: params.sbeId,
    tenantId: params.asId,
  }).data;
  const { edit } = useSearchParamsObject();
  const [search, setSearch] = useSearchParams();

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
                  setSearch((prev) => ({ ...prev, edit: true }));
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
          {edit ? <EditApplication application={application} /> : <ViewApplication />}
        </>
      ) : null}
    </PageTemplate>
  );
};
