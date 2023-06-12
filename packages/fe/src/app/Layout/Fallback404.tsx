import { Box, HStack, Link, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from '@tanstack/router';
export const ErrorFallback = ({ message }: { message: string }) => (
  <Box pt="30vh" textAlign="center">
    <VStack
      borderRadius="4px"
      border="1px solid"
      borderColor="gray.300"
      p={10}
      display="inline-flex"
      align="left"
      textAlign="left"
    >
      <HStack>
        <Link
          flex="30% 1 1"
          as="span"
          onClick={() => {
            window.history.back();
          }}
        >
          &larr; Back
        </Link>
        <RouterLink to="/">
          <Link flex="30% 1 1" as="span">
            Home
          </Link>
        </RouterLink>
        <Box flex="30% 1 1" />
      </HStack>
      <Text
        w="auto"
        textAlign="center"
        fontWeight="bold"
        fontSize="5xl"
        color="gray.300"
      >
        {message}
      </Text>
    </VStack>
  </Box>
);
