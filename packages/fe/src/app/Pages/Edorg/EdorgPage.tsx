import { Box, Button, ButtonGroup, Heading } from '@chakra-ui/react';
import { ActionGroup, ConfirmAction } from '@edanalytics/common-ui';
import { useNavigate, useParams, useSearch } from '@tanstack/router';
import { ReactNode } from 'react';
import { BiEdit, BiTrash } from 'react-icons/bi';
import { edorgQueries } from '../../api';
import { useNavToParent } from '../../helpers';
import { edorgIndexRoute } from '../../routes';
import { EditEdorg } from './EditEdorg';
import { ViewEdorg } from './ViewEdorg';
import { PageTemplate } from '../PageTemplate';

export const EdorgPage = (): ReactNode => {
  const navigate = useNavigate();
  const navToParentOptions = useNavToParent();

  const params = useParams({ from: edorgIndexRoute.id });
  const deleteEdorg = edorgQueries.useDelete({
    callback: () => {
      navigate(navToParentOptions);
    },
    sbeId: params.sbeId,
    tenantId: params.asId,
  });
  const edorg = edorgQueries.useOne({
    id: params.edorgId,
    sbeId: params.sbeId,
    tenantId: params.asId,
  }).data;
  const { edit } = useSearch({ from: edorgIndexRoute.id });

  return (
    <PageTemplate
      constrainWidth
      title={edorg?.displayName || 'Edorg'}
      actions={
        edorg ? (
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
              action={() => deleteEdorg.mutate(edorg.id)}
              headerText={`Delete ${edorg.displayName}?`}
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
      {edorg ? edit ? <EditEdorg /> : <ViewEdorg /> : null}
    </PageTemplate>
  );
};
