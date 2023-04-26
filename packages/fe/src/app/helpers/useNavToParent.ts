import { useRouter } from '@tanstack/router';

/**
 * Navigate up one level in the route tree. Useful for redirecting after deletion of a resource whose page you were on.
 * @returns Router nav options or undefined
 */
export const useNavToParent = () => {
  const matches = useRouter().state.currentMatches;
  const breadcrumbs = matches.filter((m) => m?.routeContext?.breadcrumb);
  const match = breadcrumbs[breadcrumbs.length - 2];
  const breadcrumb = match?.routeContext?.breadcrumb;

  return match && breadcrumb
    ? {
        to: match.route.fullPath,
        search: {},
        params: breadcrumb().params,
      }
    : undefined;
};
