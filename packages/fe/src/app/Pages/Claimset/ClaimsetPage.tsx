import { Box, Button, ButtonGroup, Heading } from '@chakra-ui/react';
import { ActionGroup, ConfirmAction } from '@edanalytics/common-ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams, useSearch } from '@tanstack/router';
import { BiEdit, BiTrash } from 'react-icons/bi';
import { claimsetQueries, userQueries } from '../../api';
import { claimsetIndexRoute } from '../../routes';
import { useNavToParent } from '../../helpers';
import { EditClaimset } from './EditClaimset';
import { ViewClaimset } from './ViewClaimset';
import { ReactNode } from 'react';
import { PageTemplate } from '../PageTemplate';

export const ClaimsetPage = (): ReactNode => {
  const navigate = useNavigate();
  const navToParentOptions = useNavToParent();

  const params = useParams({ from: claimsetIndexRoute.id });
  const deleteClaimset = claimsetQueries.useDelete({
    callback: () => {
      navigate(navToParentOptions);
    },
    sbeId: params.sbeId,
    tenantId: params.asId,
  });
  const claimset = claimsetQueries.useOne({
    enabled: params.asId !== undefined,
    id: params.claimsetId,
    sbeId: params.sbeId,
    tenantId: params.asId,
  }).data;
  const { edit } = useSearch({ from: claimsetIndexRoute.id });

  return (
    <PageTemplate
      constrainWidth
      title={claimset?.displayName || 'Claimset'}
      actions={
        claimset ? (
          <>
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
              action={() => deleteClaimset.mutate(claimset.id)}
              headerText={`Delete ${claimset.displayName}?`}
              bodyText="You won't be able to get it back"
            >
              {(props) => (
                <Button {...props} leftIcon={<BiTrash />}>
                  Delete
                </Button>
              )}
            </ConfirmAction>
          </>
        ) : null
      }
    >
      {claimset ? edit ? <EditClaimset /> : <ViewClaimset /> : null}
    </PageTemplate>
  );
};
