import { Button, ButtonGroup } from '@chakra-ui/react';
import { OperationResultDto } from '@edanalytics/models';
import { Meta, StoryObj } from '@storybook/react';
import { useOperationResultDisclosure } from './OperationResult';

const ToastApp: React.FC<OperationResultDto> = (props: OperationResultDto) => {
  const { disclose, ModalRoot, popModal, popToast } =
    useOperationResultDisclosure();
  return (
    <ButtonGroup>
      <Button onClick={() => disclose(props)}>Auto</Button>
      <Button onClick={() => popToast(props)}>Toast</Button>
      <Button onClick={() => popModal(props)}>Modal</Button>
      <ModalRoot />
    </ButtonGroup>
  );
};

const meta: Meta<typeof ToastApp> = {
  title: 'OperationResultToast',
  component: ToastApp,
};
export default meta;

export const Standard: StoryObj<typeof ToastApp> = {
  args: {
    id: 0,
    title: 'Sync failed',
    messages: ['SB Meta: retrieval succeeded.', 'Admin API: Invalid token.'],
    statuses: [
      {
        name: 'Admin API',
        success: false,
      },
      {
        name: 'SB Meta',
        success: true,
      },
    ],
  },
};
