import { Box, Button, ButtonGroup, Heading } from '@chakra-ui/react';
import { ActionGroup, ConfirmAction } from '@edanalytics/common-ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams, useSearch } from '@tanstack/router';
import { BiEdit, BiTrash } from 'react-icons/bi';
import { sbeQueries, userQueries } from '../../api';
import { sbeIndexRoute } from '../../routes';
import { useNavToParent } from '../../helpers';
import { EditSbe } from './EditSbe';
import { ViewSbe } from './ViewSbe';
import { ReactNode } from 'react';
import { PageTemplate } from '../PageTemplate';

export const SbePage = (): ReactNode => {
  const navigate = useNavigate();
  const navToParentOptions = useNavToParent();

  const params = useParams({ from: sbeIndexRoute.id });
  const deleteSbe = sbeQueries.useDelete({
    callback: () => {
      navigate(navToParentOptions);
    },
    tenantId: params.asId,
  });
  const sbe = sbeQueries.useOne({
    id: params.sbeId,
    tenantId: params.asId,
  }).data;
  const { edit } = useSearch({ from: sbeIndexRoute.id });

  return (
    <PageTemplate
      constrainWidth
      title={sbe?.displayName || 'Sbe'}
      actions={
        sbe ? (
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
          </>
        ) : null
      }
    >
      {sbe ? edit ? <EditSbe /> : <ViewSbe /> : null}
    </PageTemplate>
  );
};
