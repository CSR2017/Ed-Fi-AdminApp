import { UseQueryResult } from '@tanstack/react-query';

export const getRelationDisplayName = <
  R extends { displayName?: string | number }
>(
  source: number | undefined,
  relations: UseQueryResult<Record<string | number, R>, unknown>
) =>
  source === undefined
    ? undefined
    : relations.data?.[source]?.displayName || source;
