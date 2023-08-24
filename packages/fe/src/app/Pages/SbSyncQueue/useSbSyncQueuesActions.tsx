import { HiInboxIn } from 'react-icons/hi';
import { usePopBanner } from '../../Layout/FeedbackBanner';
import { usePostSbSyncQueue } from '../../api';
import { AuthorizeComponent } from '../../helpers';
import { ActionProps, ActionsType } from '../../helpers/ActionsType';
import { mutationErrCallback } from '../../helpers/mutationErrCallback';

export const useSbSyncQueuesActions = (): ActionsType => {
  const postSyncQueue = usePostSbSyncQueue();
  const popBanner = usePopBanner();

  return {
    Queue: (props: { children: (props: ActionProps) => JSX.Element }) => {
      return (
        <AuthorizeComponent
          config={{
            privilege: 'sbe:refresh-resources',
            subject: {
              id: '__filtered__',
            },
          }}
        >
          <props.children
            icon={HiInboxIn}
            text="Sync all environments"
            title={'Trigger sync of all environments'}
            onClick={() =>
              postSyncQueue.mutateAsync(undefined, {
                onSuccess: (res) => popBanner(res),
                ...mutationErrCallback({ popBanner }),
              })
            }
          />
        </AuthorizeComponent>
      );
    },
  };
};
