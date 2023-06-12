import {
  GetSessionDataDto,
  GetTenantDto,
  GetUserDto,
  PutUserDto,
} from '@edanalytics/models';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { methods } from '../methods';

const baseUrl = '';

export const useMe = () =>
  useQuery({
    staleTime: 30 * 1000,
    queryKey: [`me`],
    queryFn: () =>
      methods
        .getOne(`${baseUrl}/auth/me`, GetSessionDataDto)
        .then((res) => {
          return res;
        })
        .catch((err) => {
          if (err.statusCode === 403) {
            return null;
          } else {
            throw err;
          }
        }),
  });
export const useMyTenants = () =>
  useQuery({
    staleTime: 30 * 1000,
    queryKey: [`me`, 'tenants'],
    queryFn: () =>
      methods.getManyMap(`${baseUrl}/auth/my-tenants`, GetTenantDto),
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
