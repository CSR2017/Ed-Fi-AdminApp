import { BsHouseDoor, BsHouseDoorFill, BsPerson, BsPersonFill } from 'react-icons/bs';
import { useLocation, useMatches } from 'react-router-dom';
import { NavButton } from './NavButton';

export const UniversalNavLinks = (props: object) => {
  const currentMatches = useMatches();
  const path = useLocation().pathname;
  return (
    <>
      <NavButton
        {...{
          route: '/',
          icon: BsHouseDoor,
          activeIcon: BsHouseDoorFill,
          text: 'Home',
          isActive: /^\/(as\/\d+\/?)?$/.test(path),
        }}
      />
      <NavButton
        {...{
          route: '/account',
          icon: BsPerson,
          activeIcon: BsPersonFill,
          text: 'Account',
          isActive: currentMatches.some((m) => m.pathname.startsWith('/account')),
        }}
      />
    </>
  );
};
