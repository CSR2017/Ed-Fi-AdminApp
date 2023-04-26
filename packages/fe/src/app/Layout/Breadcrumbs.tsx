import { ChevronRightIcon } from '@chakra-ui/icons';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbProps,
  StyleProps,
} from '@chakra-ui/react';
import { Link as RouterLink, useMatches } from '@tanstack/router';

export const Breadcrumbs = (props: BreadcrumbProps & StyleProps) => {
  const matches = useMatches();
  const breadcrumbs = matches.filter((m) => m?.routeContext?.breadcrumb);

  return (
    <Breadcrumb
      size="sm"
      spacing={1}
      color="gray.500"
      separator={<ChevronRightIcon />}
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
            <BreadcrumbLink {...props}>
              <LinkTitle />
            </BreadcrumbLink>
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};
