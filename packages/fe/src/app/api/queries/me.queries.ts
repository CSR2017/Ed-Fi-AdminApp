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
    queryKey: [`me`],
    queryFn: () =>
      methods.getOne<GetSessionDataDto>(
        `${baseUrl}/auth/me`,
        GetSessionDataDto
      ),
  });
export const useMyTenants = () =>
  useQuery({
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
