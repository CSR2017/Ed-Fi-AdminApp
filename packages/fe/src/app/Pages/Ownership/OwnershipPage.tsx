import { Box, Button, ButtonGroup, Heading } from '@chakra-ui/react';
import { ActionGroup, ConfirmAction } from '@edanalytics/common-ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams, useSearch } from '@tanstack/router';
import { BiEdit, BiTrash } from 'react-icons/bi';
import { ownershipQueries, userQueries } from '../../api';
import { ownershipIndexRoute } from '../../routes';
import { useNavToParent } from '../../helpers';
import { EditOwnership } from './EditOwnership';
import { ViewOwnership } from './ViewOwnership';
import { ReactNode } from 'react';
import { PageTemplate } from '../PageTemplate';

export const OwnershipPage = (): ReactNode => {
  const navigate = useNavigate();
  const navToParentOptions = useNavToParent();

  const params = useParams({ from: ownershipIndexRoute.id });
  const deleteOwnership = ownershipQueries.useDelete({
    callback: () => {
      navigate(navToParentOptions);
    },
    tenantId: params.asId,
  });
  const ownership = ownershipQueries.useOne({
    id: params.ownershipId,
    tenantId: params.asId,
  }).data;
  const { edit } = useSearch({ from: ownershipIndexRoute.id });

  return (
    <PageTemplate title={ownership?.displayName || 'Ownership'} constrainWidth>
      {ownership ? (
        <Box maxW="40em" borderTop="1px solid" borderColor="gray.200">
          <ActionGroup>
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
          </ActionGroup>

          {edit ? <EditOwnership /> : <ViewOwnership />}
        </Box>
      ) : null}
    </PageTemplate>
  );
};
