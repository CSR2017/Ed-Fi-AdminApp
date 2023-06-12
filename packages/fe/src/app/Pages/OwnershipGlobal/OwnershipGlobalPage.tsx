import { Button, useBoolean, useToast } from '@chakra-ui/react';
import { ConfirmAction } from '@edanalytics/common-ui';
import { useNavigate, useParams, useSearch } from '@tanstack/router';
import { ReactNode } from 'react';
import { BiEdit, BiTrash } from 'react-icons/bi';
import { ownershipQueries } from '../../api';
import { AuthorizeComponent, useNavToParent } from '../../helpers';
import { ownershipGlobalIndexRoute } from '../../routes';
import { PageTemplate } from '../PageTemplate';
import { EditOwnershipGlobal } from './EditOwnershipGlobal';
import { ViewOwnershipGlobal } from './ViewOwnershipGlobal';

export const OwnershipGlobalPage = (): ReactNode => {
  const navigate = useNavigate();
  const navToParentOptions = useNavToParent();

  const params = useParams({ from: ownershipGlobalIndexRoute.id });
  const deleteOwnership = ownershipQueries.useDelete({
    callback: () => {
      navigate(navToParentOptions);
    },
  });
  const ownership = ownershipQueries.useOne({
    id: params.ownershipId,
  }).data;
  const { edit } = useSearch({ from: ownershipGlobalIndexRoute.id });

  return (
    <PageTemplate
      constrainWidth
      title={ownership?.displayName || 'Ownership'}
      actions={
        ownership ? (
          <>
            <AuthorizeComponent
              config={{
                privilege: 'ownership:update',
                subject: {
                  id: params.ownershipId,
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
                Edit
              </Button>
            </AuthorizeComponent>
            <AuthorizeComponent
              config={{
                privilege: 'ownership:delete',
                subject: {
                  id: params.ownershipId,
                },
              }}
            >
              <ConfirmAction
                action={() => deleteOwnership.mutate(ownership.id)}
                headerText={`Delete ${ownership.displayName}?`}
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
      {ownership ? (
        edit ? (
          <EditOwnershipGlobal ownership={ownership} />
        ) : (
          <ViewOwnershipGlobal />
        )
      ) : null}
    </PageTemplate>
  );
};
