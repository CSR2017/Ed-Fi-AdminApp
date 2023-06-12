import { ButtonGroup, chakra } from '@chakra-ui/react';

export const ActionGroup = (props: Parameters<typeof ButtonGroup>['0']) => (
  <ButtonGroup
    size="action-bar"
    variant="outline"
    colorScheme="blue"
    display="flex"
    justifyContent="flex-end"
    spacing={2}
    py={2}
    mb={10}
    {...props}
  />
);
