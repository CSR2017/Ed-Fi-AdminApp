import { UseQueryResult } from '@tanstack/react-query';

export const getEntityFromQuery = <R extends object>(
  source: number | string | undefined | null,
  relations: UseQueryResult<Record<string | number, R>, unknown>
) => (source === undefined || source === null ? undefined : relations.data?.[source] || undefined);
