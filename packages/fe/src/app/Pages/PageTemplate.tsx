import { Box, HStack, Heading } from '@chakra-ui/react';
import { ActionGroup } from '@edanalytics/common-ui';
import { ReactNode } from 'react';

export const PageTemplate = (props: {
  title: string;
  children: ReactNode;
  constrainWidth?: boolean;
  justifyActionsLeft?: boolean;
  actions?: ReactNode;
}) => {
  return (
    <Box maxW={props.constrainWidth ? undefined : undefined} mx="-0.5rem" px="0.5rem">
      <HStack
        borderTop="1px solid"
        borderBottom="1px solid"
        borderColor="gray.300"
        justify="space-between"
        mb={10}
        bg="gray.50"
        mx="-0.5rem"
        px="0.5rem"
      >
        <Heading color="gray.700" size="page-heading">
          {props.title}
        </Heading>
        <ActionGroup m={0} justifyContent={props.constrainWidth ? 'flex-end' : 'flex-start'}>
          {props.actions}
        </ActionGroup>
      </HStack>
      {props.children}
    </Box>
  );
};
