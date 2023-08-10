import { ButtonGroup, Button } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

export const LandingContent = () => (
  <ButtonGroup size="lg" gap={10}>
    <Button
      autoFocus
      w="8em"
      fontSize="xl"
      variant="solid"
      colorScheme="blue"
      as={RouterLink}
      to="/login"
    >
      Log in
    </Button>
    <Button
      fontSize="xl"
      w="8em"
      variant="outline"
      colorScheme="blue"
      as={RouterLink}
      to="https://www.edanalytics.org/products/starting-blocks"
    >
      Learn more
    </Button>
  </ButtonGroup>
);
