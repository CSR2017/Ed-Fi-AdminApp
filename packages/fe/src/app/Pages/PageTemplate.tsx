import { Box, Heading } from '@chakra-ui/react';
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
    <>
      <Heading color="gray.700" size="page-heading">
        {props.title}
      </Heading>
      <Box
        maxW={props.constrainWidth ? '40em' : undefined}
        borderTop="1px solid"
        borderColor="gray.200"
        mx="-1rem"
        px="1rem"
      >
        <ActionGroup
          justifyContent={props.constrainWidth ? 'flex-end' : 'flex-start'}
        >
          {props.actions}
        </ActionGroup>
        {props.children}
      </Box>
    </>
  );
};
