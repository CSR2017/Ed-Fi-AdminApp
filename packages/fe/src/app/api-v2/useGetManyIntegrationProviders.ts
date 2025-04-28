import { type UseQueryOptions, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { GetIntegrationProviderDto } from '@edanalytics/models';
import { apiClient } from './apiClient';
import { QUERY_KEYS } from './queryKeys';

type Props = Omit<UseQueryOptions, 'queryKey'> & {
  queryArgs?: {
    teamId?: number;
  };
  queryKey?: string[];
};

export function useGetManyIntegrationProviders({ queryArgs, queryKey, ...rest }: Props) {
  const { teamId } = queryArgs ?? {};
  return useQuery({
    queryKey: queryKey ?? [QUERY_KEYS.integrationProviders, teamId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (teamId) params.append('teamId', teamId.toString());

      const response = await apiClient.get(`integration-providers?${params}`);
      return response;
    },
    ...rest,
  }) as UseQueryResult<GetIntegrationProviderDto[]>;
}
