import { GetSessionDataDto, GetTenantDto, GetUserDto, PutUserDto } from '@edanalytics/models';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { plainToInstance } from 'class-transformer';
import { useEffect } from 'react';
import { methods } from '../methods';

const baseUrl = '';

export const useMe = () => {
  const queryClient = useQueryClient();
  const me = useQuery({
    staleTime: 30 * 1000,
    queryKey: [`me`],
    queryFn: () =>
      axios
        .get(`${baseUrl}/auth/me`, { withCredentials: true })
        .then((res) => {
          const me = plainToInstance(GetSessionDataDto, res.data);
          return me;
        })
        .catch((err) => {
          if (err.response.status === 401) {
            return null;
          } else {
            throw err;
          }
        }),
  });
  useEffect(() => {
    // The most common real-world trigger is probably CUD on tenant memberships or the global role. So refetch all auth caches.
    queryClient.invalidateQueries({ queryKey: ['auth-cache'] });
  }, [me.data, queryClient]);
  return me;
};
export const useMyTenants = () =>
  useQuery({
    staleTime: 30 * 1000,
    queryKey: [`me`, 'tenants'],
    queryFn: () => {
      return methods.getManyMap(`${baseUrl}/auth/my-tenants`, GetTenantDto);
    },
  });
export const usePutMe = (callback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: PutUserDto) =>
      methods.put(`${baseUrl}/users/${user.id}`, PutUserDto, GetUserDto, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      callback && callback();
    },
  });
};
