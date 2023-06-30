import {
  GetSessionDataDto,
  GetTenantDto,
  GetUserDto,
  PutUserDto,
} from '@edanalytics/models';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { methods } from '../methods';
import axios from 'axios';
import { plainToInstance } from 'class-transformer';

const baseUrl = '';

export const useMe = () =>
  useQuery({
    staleTime: 30 * 1000,
    queryKey: [`me`],
    queryFn: () =>
      axios
        .get(`${baseUrl}/auth/me`, { withCredentials: true })
        .then((res) => {
          return plainToInstance(GetSessionDataDto, res.data);
        })
        .catch((err) => {
          if (err.response.status === 403 || err.response.status === 401) {
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
