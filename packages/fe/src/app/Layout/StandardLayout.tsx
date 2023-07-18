import { Box, Flex, HStack, VStack, Text } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { Outlet } from 'react-router-dom';
import React from 'react';
import { AppBar } from './AppBar';
import { Breadcrumbs } from './Breadcrumbs';
import { Nav } from './Nav';
import { useMe } from '../api';
import { AppBarPublic } from './AppBarPublic';

export const StandardLayout = () => {
  const queryClient = useQueryClient();
  const me = useMe();
  const isLoggedIn = !!me.data;
  const hasRole = !!me.data?.role;

  const [err, setErr] = React.useState<null | any>(null);
  if (err) {
    throw err;
  }

  queryClient.setDefaultOptions({
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: false,
      onError: (err) => {
        setErr(err);
      },
    },
  });
  return (
    <VStack spacing={0} h="100vh" overflow="hidden">
      {isLoggedIn ? <AppBar /> : <AppBarPublic />}
      <HStack as="main" w="100%" flex="auto 1 1" align="start" overflow="hidden" spacing={0}>
        {hasRole ? (
          <>
            <Nav />
            <Box p={3} px="calc(4vw + 0.5em)" maxH="100%" h="100%" overflow="auto" flexGrow="1">
              <Flex flexDir="column" minW="35em" h="100%">
                <Breadcrumbs mb={5} />
                <Box flexGrow={1} pb="2em">
                  <Outlet />
                </Box>
              </Flex>
            </Box>
          </>
        ) : isLoggedIn ? (
          <Box w="100%" pt="30vh" textAlign="center">
            <VStack
              borderRadius="4px"
              border="1px solid"
              borderColor="gray.400"
              py="5em"
              pb="6em"
              px="6em"
              maxW="70em"
              display="inline-flex"
              align="left"
              textAlign="left"
              spacing="4em"
            >
              <Text w="auto" textAlign="center" fontWeight="bold" fontSize="5xl" color="gray.400">
                We found you in our database, but you don't have a role assigned yet.
              </Text>
            </VStack>
          </Box>
        ) : null}
      </HStack>
    </VStack>
  );
};
