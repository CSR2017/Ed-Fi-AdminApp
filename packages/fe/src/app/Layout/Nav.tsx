import { Box, Text } from '@chakra-ui/react';
import { AnyRoute, useRouter } from '@tanstack/router';
import { Resizable } from 're-resizable';
import {
  BsClipboard,
  BsClipboardFill,
  BsGear,
  BsGearFill,
  BsPerson,
  BsPersonFill,
} from 'react-icons/bs';
import { HiHome, HiOutlineHome } from 'react-icons/hi';
import { accountRoute, indexRoute, usersRoute } from '../routes';
import { INavButtonProps, NavButton } from './NavButton';

export const Nav = () => {
  const items: INavButtonProps[] = [
    {
      route: usersRoute,
      icon: BsPerson,
      activeIcon: BsPersonFill,
      text: 'Users',
    },
  ];

  const staticItems: INavButtonProps[] = [
    {
      route: indexRoute,
      icon: HiOutlineHome,
      activeIcon: HiHome,
      text: 'Home',
    },
    {
      route: accountRoute,
      icon: BsPerson,
      activeIcon: BsPersonFill,
      text: 'Account',
    },
  ];
  const flatItems = [
    ...items.flatMap((item) => [item, ...(item.childItems ?? [])]),
    ...staticItems.flatMap((item) => [item, ...(item.childItems ?? [])]),
  ];

  let deepestMatch = null;
  const router = useRouter();

  router.state.currentMatches.forEach((m) => {
    if (flatItems.some((item) => item.route.id === m.route.id)) {
      deepestMatch = m;
    }
  });

  const tagMatch = (
    items: INavButtonProps[],
    match: AnyRoute | null
  ): INavButtonProps[] =>
    match === null
      ? items
      : items.map((item) => ({
          ...item,
          isActive: item.route.id === match.id,
          childItems: tagMatch(item.childItems || [], match),
        }));

  return (
    <Box
      py={3}
      flex="0 0 15em"
      overflowX="hidden"
      overflowY="auto"
      bg="rgb(248,248,248)"
      borderRight="1px solid"
      borderColor="gray.200"
      enable={{ right: true }}
      defaultSize={{ width: '15em', height: '100%' }}
      minWidth="5em"
      maxWidth="min(40em, 80%)"
      as={Resizable}
    >
      <Text px={3} as="h3" color="gray.500" mb={2} fontWeight="600">
        Pages
      </Text>
      {tagMatch(staticItems, deepestMatch).map((item) => (
        <NavButton key={item.text + item.route.fullPath} {...item} />
      ))}
      <Text px={3} mt={4} as="h3" color="gray.500" mb={2} fontWeight="600">
        Resources
      </Text>
      {tagMatch(items, deepestMatch).map((item) => (
        <NavButton key={item.text + item.route.fullPath} {...item} />
      ))}
    </Box>
  );
};
