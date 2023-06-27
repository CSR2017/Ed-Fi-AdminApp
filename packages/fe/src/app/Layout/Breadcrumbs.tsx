import { ChevronRightIcon } from '@chakra-ui/icons';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbProps,
  StyleProps,
  Text,
} from '@chakra-ui/react';
import { Link as RouterLink, useMatches } from '@tanstack/router';
import { useEffect, useState } from 'react';

export const Breadcrumbs = (props: BreadcrumbProps & StyleProps) => {
  const matches = useMatches();
  const breadcrumbs = matches.filter((m) => m?.routeContext?.breadcrumb);

  const [terminalItemRef, setTerminalItemRef] =
    useState<HTMLAnchorElement | null>(null);

  useEffect(() => {
    // This non-reactive approach is ugly, but it's harmless and a way to avoid making the structure of the breadcrumb functions into a big deal.
    const titlePoll = setInterval(() => {
      if (terminalItemRef?.innerText !== undefined) {
        document.title =
          terminalItemRef?.innerText === 'Home'
            ? 'Starting Blocks'
            : terminalItemRef?.innerText + ' | Starting Blocks';
      }
    }, 500);
    return () => {
      clearInterval(titlePoll);
    };
  }, [terminalItemRef?.innerText]);

  return (
    <Breadcrumb
      size="sm"
      spacing={1}
      color="gray.500"
      separator={
        <Text color="gray.200" pb="0.175em" fontSize="2xl" mx="0.3em">
          /
        </Text>
      }
      {...props}
    >
      {breadcrumbs.map((match, i) => {
        const breadcrumb = match?.routeContext?.breadcrumb;
        const LinkTitle = breadcrumb && breadcrumb()?.title;
        const props: any = {
          as: RouterLink,
          to: match.route.fullPath,
          search: {},
          params: breadcrumb().params,
        };
        return (
          <BreadcrumbItem key={match.pathname}>
            <BreadcrumbLink
              ref={(newRef) => {
                i === breadcrumbs.length - 1 && setTerminalItemRef(newRef);
              }}
              {...props}
            >
              <LinkTitle />
            </BreadcrumbLink>
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};
