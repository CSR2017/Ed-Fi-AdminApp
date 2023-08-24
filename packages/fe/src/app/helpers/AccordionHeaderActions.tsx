import { ChevronDownIcon } from '@chakra-ui/icons';
import { Button, Menu, MenuButton, MenuList } from '@chakra-ui/react';
import { ActionsType } from './ActionsType';
import { ActionMenuButton } from './getStandardActions';

export const AccordionHeaderActions = (props: { actions: ActionsType }) => {
  const hidden = Object.entries(props.actions);

  return hidden.length > 0 ? (
    <Menu size="action-bar" variant="solid" colorScheme="blue">
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        size="action-bar"
        variant="solid"
        colorScheme="blue"
      >
        Actions
      </MenuButton>
      <MenuList>
        {hidden.map(([key, Action]) => (
          <Action key={key}>{ActionMenuButton}</Action>
        ))}
      </MenuList>
    </Menu>
  ) : null;
};
