import { Button } from '@chakra-ui/react';
import { ConfirmAction } from '@edanalytics/common-ui';
import { BiEdit, BiTrash } from 'react-icons/bi';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { claimsetQueries } from '../../api';
import { useNavToParent } from '../../helpers';
import { useSearchParamsObject } from '../../helpers/useSearch';
import { PageTemplate } from '../PageTemplate';
import { ViewClaimset } from './ViewClaimset';

export const ClaimsetPage = () => {
  const navigate = useNavigate();
  const navToParentOptions = useNavToParent();

  const params = useParams() as {
    asId: string;
    sbeId: string;
    claimsetId: string;
  };
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
  const { edit } = useSearchParamsObject();
  const [search, setSearch] = useSearchParams();

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
                setSearch((prev) => ({ ...prev, edit: true }));
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
      {claimset ? <ViewClaimset /> : null}
    </PageTemplate>
  );
};
