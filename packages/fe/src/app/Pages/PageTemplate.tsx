import { Alert, AlertIcon, Box, HStack, Heading, Text } from '@chakra-ui/react';
import { ActionGroup } from '@edanalytics/common-ui';
import { ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export const PageTemplate = (props: {
  title: ReactNode;
  children?: ReactNode;
  constrainWidth?: boolean;
  justifyActionsLeft?: boolean;
  actions?: ReactNode;
}) => {
  return (
    <Box mx="-0.5rem" px="0.5rem">
      <HStack
        borderTop="1px solid"
        borderBottom="1px solid"
        borderColor="gray.300"
        justify="space-between"
        mb="2em"
        bg="gray.50"
        mx="-0.5rem"
        px="0.5rem"
      >
        <Heading color="gray.700" size="page-heading">
          {props.title}
        </Heading>
        <ErrorBoundary
          FallbackComponent={(arg: { error: { message: string } }) => (
            <Text as="i" color="gray.500" fontSize="sm">
              Unable to show actions
            </Text>
          )}
        >
          <ActionGroup m={0} justifyContent={props.constrainWidth ? 'flex-end' : 'flex-start'}>
            {props.actions}
          </ActionGroup>
        </ErrorBoundary>
      </HStack>
      <ErrorBoundary
        FallbackComponent={(arg: { error: { message: string } }) => (
          <Box mt="-1em" mx="-0.5rem">
            <Alert status="error">
              <AlertIcon />
              {arg.error.message}
            </Alert>
          </Box>
        )}
      >
        <Box maxW={props.constrainWidth ? '25em' : undefined}>{props.children}</Box>
      </ErrorBoundary>
    </Box>
  );
};
