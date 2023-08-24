import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { Outlet, useParams } from 'react-router-dom';
import { useMe } from '../api';
import { NavContextProvider } from '../helpers';
import { AppBar } from './AppBar';
import { AppBarPublic } from './AppBarPublic';
import { Breadcrumbs } from './Breadcrumbs';
import { FeedbackBanners } from './FeedbackBanner';
import { LandingLayoutRouteElement } from './LandingLayout';
import { Nav, asTenantIdAtom } from './Nav';

export const StandardLayout = () => {
  const me = useMe();
  const isLoggedIn = me.data !== undefined && me.data !== null;
  const hasRole = !!me.data?.role;
  const asId = useAtomValue(asTenantIdAtom);
  const params = useParams();

  return (
    <NavContextProvider asId={asId} sbeId={'sbeId' in params ? Number(params.sbeId) : undefined}>
      <VStack spacing={0} h="100vh" overflow="hidden">
        {isLoggedIn ? <AppBar /> : <AppBarPublic />}
        <HStack as="main" w="100%" flex="auto 1 1" align="start" overflow="hidden" spacing={0}>
          {hasRole ? (
            <>
              <Nav />
              <Box maxH="100%" h="100%" overflow="auto" flexGrow="1">
                <Flex flexDir="column" minW="35em" h="100%">
                  <FeedbackBanners />
                  <Box p={3} px="calc(4vw + 0.5em)">
                    <Breadcrumbs mb={5} />
                    <Box flexGrow={1} pb="2em">
                      {/* asId might be one render behind */}
                      {params.asId && asId === undefined ? null : <Outlet />}
                    </Box>
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
          ) : me.isLoading ? null : (
            <LandingLayoutRouteElement />
          )}
        </HStack>
      </VStack>
    </NavContextProvider>
  );
};
