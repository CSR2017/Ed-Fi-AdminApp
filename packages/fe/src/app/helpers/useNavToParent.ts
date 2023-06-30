import { useMatches } from 'react-router-dom';

/**
 * Navigate up one level in the route tree. Useful for redirecting after deletion of a resource whose page you were on.
 * @returns Router nav options or undefined
 */
export const useNavToParent = () => {
  const matches = useMatches();

  return matches.length > 1 ? matches.slice(-1)[0].pathname : '/';
};
