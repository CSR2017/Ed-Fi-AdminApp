import { Box, Button, ButtonGroup, Heading } from '@chakra-ui/react';
import { ActionGroup, ConfirmAction } from '@edanalytics/common-ui';
import { useNavigate, useParams, useSearch } from '@tanstack/router';
import { ReactNode } from 'react';
import { BiEdit, BiTrash } from 'react-icons/bi';
import { odsQueries } from '../../api';
import { useNavToParent } from '../../helpers';
import { odsIndexRoute } from '../../routes';
import { EditOds } from './EditOds';
import { ViewOds } from './ViewOds';
import { PageTemplate } from '../PageTemplate';

export const OdsPage = (): ReactNode => {
  const navigate = useNavigate();
  const navToParentOptions = useNavToParent();

  const params = useParams({ from: odsIndexRoute.id });
  const deleteOds = odsQueries.useDelete({
    callback: () => {
      navigate(navToParentOptions);
    },
    sbeId: params.sbeId,
    tenantId: params.asId,
  });
  const ods = odsQueries.useOne({
    id: params.odsId,
    sbeId: params.sbeId,
    tenantId: params.asId,
  }).data;
  const { edit } = useSearch({ from: odsIndexRoute.id });

  return (
    <PageTemplate
      constrainWidth
      title={ods?.displayName || 'Ods'}
      actions={
        ods ? (
          <>
            <Button
              isDisabled={edit}
              leftIcon={<BiEdit />}
              onClick={() => {
                navigate({
                  to: odsIndexRoute.fullPath,
                  params: (old: any) => old,
                  search: { edit: true },
                });
              }}
            >
              Edit
            </Button>
            <ConfirmAction
              action={() => deleteOds.mutate(ods.id)}
              headerText={`Delete ${ods.displayName}?`}
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
      {ods ? edit ? <EditOds /> : <ViewOds /> : null}
    </PageTemplate>
  );
};
