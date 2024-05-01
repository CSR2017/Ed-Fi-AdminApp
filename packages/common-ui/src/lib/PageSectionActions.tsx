import { ChevronDownIcon } from '@chakra-ui/icons';
import { Box, Button, Menu, MenuButton, MenuList, Portal } from '@chakra-ui/react';
import { ActionsType } from './ActionsType';
import { ActionBarButton, ActionMenuButton } from './getStandardActions';
import { ActionGroup, splitActions } from '.';

export const PageSectionActions = (props: {
  actions: ActionsType;
  show?: number | undefined | true;
}) => {
  const { show, actions } = props;
  const { hidden, visible } = splitActions(actions, show);
  return (
    <Box position="relative">
      <ActionGroup
        pos="absolute"
        top="-1.5em"
        right="-1.5em"
        zIndex={0}
        css={{
          '& > a': {
            borderRadius: 0,
          },
          '& > button': {
            borderRadius: 0,
          },
          /*
      React doesn't like this selector bc of SSR, but
      we aren't doing SSR, and the preferred alternative
      (:first-of-type) doesn't work here because we have
      both <a> and <button> children
      */
          '& > *:first-child': {
            borderBottomLeftRadius: 'var(--chakra-radii-md)',
          },
          '& > *:last-child': {
            borderTopRightRadius: 'var(--chakra-radii-md)',
          },
          '& > *:not(:first-child)': {
            borderLeftWidth: '1px',
          },
        }}
        isAttached
        p={0}
        m={0}
      >
        {visible.map(([key, actionProps]) => (
          <ActionBarButton key={key} {...actionProps} />
        ))}
        {hidden.length > 0 && (
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              More
            </MenuButton>
            <Portal>
              <MenuList>
                {hidden.map(([key, actionProps]) => (
                  <ActionMenuButton key={key} {...actionProps} />
                ))}
              </MenuList>
            </Portal>
          </Menu>
        )}
      </ActionGroup>
    </Box>
  );
};
