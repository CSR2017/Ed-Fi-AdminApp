import { Box, HStack, VStack } from '@chakra-ui/react';
import { Outlet } from '@tanstack/router';
import { AppBar } from './AppBar';
import { Breadcrumbs } from './Breadcrumbs';
import { Nav } from './Nav';

export const StandardLayout = () => (
  <VStack spacing={0} h="100vh" overflow="hidden">
    <AppBar />
    <HStack
      as="main"
      w="100%"
      flex="auto 1 1"
      align="start"
      overflow="hidden"
      spacing={0}
    >
      <Nav />
      <Box
        p={3}
        px="calc(3vw + 0.5em)"
        maxH="100%"
        h="100%"
        overflow="auto"
        flexGrow="1"
      >
        <Box minW="35em" h="100%">
          <Breadcrumbs mb={3} />
          <Outlet />
        </Box>
      </Box>
    </HStack>
  </VStack>
);
