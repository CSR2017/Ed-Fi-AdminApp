import { Button, Menu, MenuButton, MenuList } from '@chakra-ui/react';
import { ActionBarButton, ActionMenuButton } from './getStandardActions';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { ActionsType } from './ActionsType';

export const ActionBarActions = (props: {
  actions: ActionsType;
  show?: number | undefined | true;
}) => {
  const { show, actions } = props;
  const hidden = Object.entries(actions);
  const visible = hidden.splice(0, show === true ? hidden.length : show === undefined ? 6 : show);
  return (
    <>
      {visible.map(([key, Action]) => (
        <Action key={key}>{ActionBarButton}</Action>
      ))}
      {hidden.length > 0 && (
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            More
          </MenuButton>
          <MenuList>
            {hidden.map(([key, Action]) => (
              <Action key={key}>{ActionMenuButton}</Action>
            ))}
          </MenuList>
        </Menu>
      )}
    </>
  );
};
